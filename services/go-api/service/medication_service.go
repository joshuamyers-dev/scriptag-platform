package service

import (
	"go-api/adapters/mappers"
	"go-api/core"
	"go-api/graph/model"
)

type MedicationServiceImpl struct {
	repo core.MedicationRepository
}

func NewMedicationService(repo core.MedicationRepository) *MedicationServiceImpl {
	return &MedicationServiceImpl{repo: repo}
}

func (s *MedicationServiceImpl) SearchMedications(query string, afterCursor *string) (*model.MedicationsConnection, error) {
	coreMeds, err := s.repo.Search(query, afterCursor)
	if err != nil {
		return nil, err
	}

	var medicationEdges []*model.MedicationEdge
	for _, med := range coreMeds.Edges {
		medicationEdges = append(medicationEdges, mappers.MapCoreMedicationEdgeToGraphQLEdge(med))
	}

	var medsConnection = &model.MedicationsConnection{
		Edges: medicationEdges,
		PageInfo: &model.PageInfo{
			StartCursor: coreMeds.PageInfo.StartCursor,
			EndCursor:   coreMeds.PageInfo.EndCursor,
			HasNextPage: &coreMeds.PageInfo.HasNextPage,
		},
	}

	return medsConnection, nil
}
