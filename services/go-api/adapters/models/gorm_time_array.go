package adapters

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"
)

type TimeArray []*time.Time

func (a *TimeArray) Scan(src interface{}) error {
    if src == nil {
        *a = nil
        return nil
    }

    str, ok := src.(string)
    if !ok {
        return fmt.Errorf("TimeArray: cannot scan type %T into TimeArray", src)
    }

    str = strings.Trim(str, "{}")
    if str == "" {
        *a = []*time.Time{}
        return nil
    }

    elements := strings.Split(str, ",")
    result := make([]*time.Time, len(elements))
    for i, elem := range elements {
        elem = strings.TrimSpace(elem)
        elem = strings.Trim(elem, `"`)
        t, err := time.Parse("15:04:05-07", elem)
        if err != nil {
            return fmt.Errorf("TimeArray: error parsing time %q: %v", elem, err)
        }
        result[i] = &t
    }

    *a = result
    return nil
}

func (a TimeArray) Value() (driver.Value, error) {
    if a == nil {
        return nil, nil
    }

    elements := make([]string, len(a))
    for i, t := range a {
        if t == nil {
            elements[i] = "NULL"
        } else {
            elements[i] = fmt.Sprintf(`"%s"`, t.Format("15:04:05-07"))
        }
    }

    return fmt.Sprintf("{%s}", strings.Join(elements, ",")), nil
}