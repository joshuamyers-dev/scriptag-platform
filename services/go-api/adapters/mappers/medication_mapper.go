package mappers

import (
	"go-api/core"
	"go-api/graph/model"
)

func MapCoreMedicationToGraphQL(coreMed *core.Medication) *model.Medication {
    if coreMed == nil {
        return nil
    }
    return &model.Medication{
        ID:               coreMed.ID,
        ActiveIngredient: coreMed.ActiveIngredient,
        BrandName:        coreMed.BrandName,
        Strength:         &coreMed.Strength,
    }
}

func MapCoreMedicationEdgeToGraphQLEdge(coreEdge *core.MedicationEdge) *model.MedicationEdge {
    if coreEdge == nil {
        return nil
    }
    return &model.MedicationEdge{
        Cursor: coreEdge.Cursor,
        Node:   MapCoreMedicationToGraphQL(coreEdge.Node),
    }
}

func MapCoreMedicationsConnectionToGraphQL(coreConn *core.MedicationConnection) *model.MedicationsConnection {
    if coreConn == nil {
        return nil
    }

    var medicationEdges []*model.MedicationEdge
    for _, edge := range coreConn.Edges {
        medicationEdges = append(medicationEdges, MapCoreMedicationEdgeToGraphQLEdge(edge))
    }

    return &model.MedicationsConnection{
        Edges: medicationEdges,
        PageInfo: &model.PageInfo{
            StartCursor: coreConn.PageInfo.StartCursor,
            EndCursor:   coreConn.PageInfo.EndCursor,
            HasNextPage: &coreConn.PageInfo.HasNextPage,
        },
    }
}