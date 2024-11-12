package utils

import (
	"strings"
)

func ConvertToTSQuery(searchText string) string {
	words := strings.Fields(searchText)

	for i, word := range words {
		words[i] = word + ":*"
	}

	return strings.Join(words, " | ")
}
