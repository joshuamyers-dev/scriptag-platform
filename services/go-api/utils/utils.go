package utils

import (
	"strings"
	"time"
)

func ConvertToTSQuery(searchText string) string {
	words := strings.Fields(searchText)

	for i, word := range words {
		words[i] = word + ":*"
	}

	return strings.Join(words, " | ")
}

func ConvertStringPointerArray(input []*string) []string {
    if input == nil {
        return []string{}
    }

    result := make([]string, len(input))
    for i, ptr := range input {
        if ptr != nil {
            result[i] = *ptr
        } else {
            result[i] = ""
        }
    }
    return result
}

func ConvertTimePointerArray(input []*time.Time) []time.Time {
	if input == nil {
        return []time.Time{}
    }

    var result []time.Time
    for _, t := range input {
        if t != nil {
            result = append(result, *t)
        }
    }
    return result
}