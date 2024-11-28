
import pandas as pd
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI, RateLimitError
from pydantic import BaseModel, TypeAdapter
from ratelimit import limits, sleep_and_retry
import time

REQUEST_RATE_LIMIT = 500
TOKEN_RATE_LIMIT = 30000
PERIOD = 60

client = OpenAI()

class Medication(BaseModel):
    brand_name: str
    active_ingredient: str
    strength: str

class Medications(BaseModel):
    medications: list[Medication]

medications_adapter = TypeAdapter(Medications)

@sleep_and_retry
@limits(calls=REQUEST_RATE_LIMIT, period=PERIOD)
def call_openai_api(text):
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Extract the medication information, filling in gaps from your knowledge. Convert all fields to title case."},
                {
                    "role": "user",
                    "content": "If the strength is missing, add an empty string. Please only include a valid JSON response. If any of the active ingredients are unable to be filled, add the ingredient as the brand name. Here it is: \n\n" + text
                }
            ],
            response_format=Medications,
            max_tokens=4000
        )

        assistant_response = response.choices[0].message.parsed

        print(assistant_response)

        return assistant_response
    except RateLimitError as e:
        print(f"Rate limit error: {e}")
        retry_after = e.response.headers.get("Retry-After", 2 ** i)
        time.sleep(float(retry_after))
        return None
    except Exception as e:
        print(f"API call failed: {e}")
        return None

def split_to_delimiters(text):
    retries = 5
    for i in range(retries):
        assistant_response = call_openai_api(text)
        if assistant_response:
            try:
                medications = assistant_response.medications
                print(f"Parsed medications: {medications}")
                return medications
            except Exception as e:
                print(f"Failed to parse response: {e}")
                time.sleep(2 ** i)  # Exponential backoff
        else:
            time.sleep(2 ** i)  # Exponential backoff
    return []

# model_id = "meta-llama/Llama-3.1-8B-Instruct"
# pipe = pipeline(
#     "text-generation",
#     model=model_id,
#     torch_dtype=torch.bfloat16,
#     device_map="auto",
# )

# tokenizer = AutoTokenizer.from_pretrained(model_id)
csv_file_path = './medications.csv'
output_csv_file_path = './processed_medications.csv'

df = pd.read_csv(csv_file_path)

processed_data = []

def process_row(row):
    medication_name = row['Name']
    return split_to_delimiters(medication_name)

def process_batch(batch):
    batch_text = " ".join(batch)
    medications = split_to_delimiters(batch_text)
    return medications

# # Estimate the average token length of medication names
# def estimate_average_token_length(df, sample_size=100):
#     sample = df['Name'].sample(n=sample_size, random_state=1)
#     total_tokens = sum(len(client.tokenizer.encode(name)) for name in sample)
#     return total_tokens / sample_size

# average_token_length = estimate_average_token_length(df)
# print(f"Average token length: {average_token_length}")

# Calculate the maximum number of medication rows that can fit within the 3k context window
MAX_CONTEXT_LENGTH = 500
max_medications_per_batch = 5
print(f"Maximum medications per batch: {max_medications_per_batch}")

with ThreadPoolExecutor(max_workers=2) as executor:
    futures = []
    for i in range(0, len(df), max_medications_per_batch):
        batch = df['Name'][i:i + max_medications_per_batch]
        futures.append(executor.submit(process_batch, batch))

    for future in as_completed(futures):
        medications = future.result()
        for med in medications:
            brand_name = med.brand_name
            active_ingredient = med.active_ingredient
            strength = med.strength
            processed_data.append({
                'brand_name': brand_name,
                'active_ingredient': active_ingredient,
                'strength': strength
            })
            print(f"Processed {brand_name}, {active_ingredient}, {strength}")

processed_df = pd.DataFrame(processed_data)
processed_df.to_csv(output_csv_file_path, index=False)

print(f"Processed data saved to {output_csv_file_path}")