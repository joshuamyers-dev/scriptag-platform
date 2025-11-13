package utils

import (
	"fmt"
	"strings"
	"time"

	"github.com/joshnissenbaum/scriptag-platform/services/go-api/graph/model"
	"github.com/joshnissenbaum/scriptag-platform/shared/models"
	"github.com/lib/pq"
)

func Pluralise(text string, count int) string {
    if count == 1 {
        return text
    }
    return text + "s"
}

func ConvertToTSQuery(searchText string) string {
	words := strings.Fields(searchText)

	for i, word := range words {
		words[i] = word + ":*"
	}

	return strings.Join(words, " | ")
}

// ConvertStringPointerArray converts a slice of *string to *pq.StringArray.
func ConvertStringPointerArray(input []*string) *pq.StringArray {
    if input == nil {
        return nil
    }
    result := &pq.StringArray{}
    for _, str := range input {
        if str != nil {
            *result = append(*result, *str)
        }
    }
    return result
}

// ConvertUintPointer converts *int to *uint.
func ConvertUintPointer(input *int) *uint {
    if input == nil {
        return nil
    }
    result := uint(*input)
    return &result
}

// ConvertStringArrayToPointerArray converts *pq.StringArray to []*string.
func ConvertStringArrayToPointerArray(input *pq.StringArray) []*string {
    if input == nil {
        return nil
    }
    var result []*string
    for _, str := range *input {
        strCopy := str
        result = append(result, &strCopy)
    }
    return result
}

// ConvertUintToIntPointer converts *uint to *int.
func ConvertUintToIntPointer(input *uint) *int {
    if input == nil {
        return nil
    }
    result := int(*input)
    return &result
}

// ConvertMethodType converts *model.MethodScheduleType to adapters.MethodType.
func ConvertMethodType(input *model.MethodScheduleType) models.MethodType {
    if input == nil {
        return ""
    }
    return models.MethodType(*input)
}

// ConvertRecurringType converts *model.RecurringScheduleType to adapters.RecurringType.
func ConvertRecurringType(input *model.RecurringScheduleType) models.RecurringType {
    if input == nil {
        return ""
    }
    return models.RecurringType(*input)
}

func ConvertShortDayToMid(day string) string {
    switch day {
    case "Su":
        return "Sun"
    case "M":
        return "Mon"
    case "Tu":
        return "Tues"
    case "W":
        return "Wed"
    case "Th":
        return "Thu"
    case "F":
        return "Fri"
    case "Sa":
        return "Sat"
    default:
        return ""
    }
}

func ConvertShortDayToTime(day string) (*time.Weekday, error) {
    var targetDay time.Weekday

    switch day {
    case "M":
        targetDay = time.Monday
    case "Tu":
        targetDay = time.Tuesday
    case "W":
        targetDay = time.Wednesday
    case "Th":
        targetDay = time.Thursday
    case "F":
        targetDay = time.Friday
    case "Sa":
        targetDay = time.Saturday
    case "Su":
        targetDay = time.Sunday
    default:
        return nil, fmt.Errorf("invalid day of the week: %s", day)
    }

    return &targetDay, nil
}

func IsSameDay(t1, t2 time.Time) bool {
    return t1.Year() == t2.Year() && t1.Month() == t2.Month() && t1.Day() == t2.Day()
}