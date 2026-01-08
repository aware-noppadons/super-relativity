# API Layer - Container Diagram

This shows how APIs expose internal components and work with data objects.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

System_Boundary(apiLayer, "API Layer") {
    Container(customerAPI, "Customer API", "REST API", "API-001")
    Container(paymentAPI, "Payment API", "REST API", "API-002")
    Container(documentAPI, "Document API", "REST API", "API-003")
    Container(transactionAPI, "Transaction API", "REST API", "API-004")
}

System_Boundary(components, "Internal Components") {
    Container(regForm, "Registration Form", "Component", "COMP-001")
    Container(customerLookup, "Customer Lookup", "Component", "COMP-006")
    Container(uploadHandler, "Upload Handler", "Component", "COMP-007")
    Container(retrievalService, "Retrieval Service", "Component", "COMP-008")
}

System_Boundary(dataLayer, "Data Layer") {
    ContainerDb(customerTable, "Customer Table", "PostgreSQL", "DATA-789")
    ContainerDb(sessionCache, "Session Cache", "Redis", "DATA-678")
    ContainerDb(transactionTable, "Transaction Table", "PostgreSQL", "DATA-456")
    ContainerDb(documentStorage, "Document Storage", "S3", "DATA-345")
    ContainerDb(auditLog, "Audit Log", "PostgreSQL", "DATA-567")
}

' API to Component EXPOSES relationships
Rel(customerAPI, customerLookup, "exposes", "Internal")
Rel(paymentAPI, regForm, "exposes", "Internal")
Rel(documentAPI, uploadHandler, "exposes", "Internal")
Rel(documentAPI, retrievalService, "exposes", "Internal")

' API to DataObject WORKS_ON relationships
Rel(customerAPI, customerTable, "read and write", "SQL")
Rel(customerAPI, sessionCache, "read data", "Redis Protocol")
Rel(paymentAPI, transactionTable, "read and write", "SQL")
Rel(documentAPI, documentStorage, "read and write", "S3 API")
Rel(documentAPI, auditLog, "write logs", "SQL")
Rel(transactionAPI, transactionTable, "read data", "SQL")

@enduml
```

## Relationships Captured

### API → Component (EXPOSES)
- API-001 (Customer API) → COMP-006 (Customer Lookup)
- API-002 (Payment API) → COMP-001 (Registration Form)
- API-003 (Document API) → COMP-007 (Upload Handler)
- API-003 (Document API) → COMP-008 (Retrieval Service)

### API → DataObject (WORKS_ON)
- API-001 → DATA-789 (Customer Table) - read and write
- API-001 → DATA-678 (Session Cache) - read
- API-002 → DATA-456 (Transaction Table) - read and write
- API-003 → DATA-345 (Document Storage) - read and write
- API-003 → DATA-567 (Audit Log) - write
- API-004 → DATA-456 (Transaction Table) - read
