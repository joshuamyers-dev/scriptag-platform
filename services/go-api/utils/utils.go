package utils

import (
	adapters "go-api/adapters/models"
	"go-api/graph/model"
	"strings"

	"github.com/lib/pq"
)

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
func ConvertMethodType(input *model.MethodScheduleType) adapters.MethodType {
    if input == nil {
        return ""
    }
    return adapters.MethodType(*input)
}

// ConvertRecurringType converts *model.RecurringScheduleType to adapters.RecurringType.
func ConvertRecurringType(input *model.RecurringScheduleType) adapters.RecurringType {
    if input == nil {
        return ""
    }
    return adapters.RecurringType(*input)
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