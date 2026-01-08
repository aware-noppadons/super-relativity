# Business Functions and APIs

This shows how business capabilities include and leverage APIs.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

System_Boundary(businessLayer, "Business Capabilities") {
    System(onboarding, "Customer Onboarding", "CAP-001")
    System(appProcessing, "Application Processing", "CAP-002")
    System(docMgmt, "Document Management", "CAP-003")
    System(customerService, "Customer Service", "CAP-004")
    System(paymentProc, "Payment Processing", "CAP-005")
    System(riskAssess, "Risk Assessment", "CAP-006")
    System(analytics, "Analytics & BI", "CAP-008")
}

System_Boundary(apiLayer, "API Layer") {
    System_Ext(customerAPI, "Customer API", "API-001")
    System_Ext(paymentAPI, "Payment API", "API-002")
    System_Ext(documentAPI, "Document API", "API-003")
    System_Ext(transactionAPI, "Transaction API", "API-004")
}

' BusinessFunction to BusinessFunction RELATES relationships
Rel(onboarding, docMgmt, "send documents to", "Internal")
Rel(appProcessing, customerService, "fetch customer data from", "Internal")
Rel(paymentProc, appProcessing, "send payment events to", "Event Stream")
Rel(riskAssess, appProcessing, "send fraud scores to", "Event Stream")

' BusinessFunction to API INCLUDES relationships
Rel(onboarding, customerAPI, "include", "REST")
Rel(appProcessing, paymentAPI, "include", "REST")
Rel(docMgmt, documentAPI, "include", "REST")
Rel(analytics, transactionAPI, "include", "REST")

@enduml
```

## Relationships Captured

### BusinessFunction → BusinessFunction (RELATES)
- CAP-001 (Customer Onboarding) → CAP-003 (Document Management) - pushes
- CAP-002 (Application Processing) → CAP-004 (Customer Service) - pulls
- CAP-005 (Payment Processing) → CAP-002 (Application Processing) - pushes
- CAP-006 (Risk Assessment) → CAP-002 (Application Processing) - pushes

### BusinessFunction → API (INCLUDES)
- CAP-001 (Customer Onboarding) → API-001 (Customer API)
- CAP-002 (Application Processing) → API-002 (Payment API)
- CAP-003 (Document Management) → API-003 (Document API)
- CAP-008 (Analytics & BI) → API-004 (Transaction API)
