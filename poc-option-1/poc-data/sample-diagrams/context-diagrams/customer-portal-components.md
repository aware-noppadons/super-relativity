# Customer Portal - Component Diagram

This shows the component-level architecture and dependencies for the Customer Portal application.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

Container(portal, "Customer Portal", "Web Application", "Main customer-facing portal")
Component(regForm, "Registration Form", "React Component", "COMP-001")
Component(dashboard, "Status Dashboard", "React Component", "COMP-002")
Component(authService, "Authentication Service", "Node.js", "COMP-003")
Component(validator, "Application Validator", "Node.js", "COMP-004")
Component(fraudDetector, "Fraud Detector", "Python", "COMP-005")
Component(customerLookup, "Customer Lookup", "Node.js", "COMP-006")
Component(uploadHandler, "Upload Handler", "Node.js", "COMP-007")
Component(retrievalService, "Retrieval Service", "Node.js", "COMP-008")

System_Ext(customerAPI, "Customer API", "API-001")
System_Ext(paymentAPI, "Payment API", "API-002")
System_Ext(documentAPI, "Document API", "API-003")

' Component to Component RELATES relationships
Rel(regForm, validator, "depends on", "HTTP")
Rel(dashboard, validator, "depends on", "HTTP")
Rel(dashboard, fraudDetector, "depends on", "HTTP")
Rel(uploadHandler, retrievalService, "uses", "Internal")

' Component to Component CONTAINS relationships
Rel(regForm, authService, "contains", "Embedded")
Rel(customerLookup, authService, "contains", "Embedded")

' Component to API CALLS relationships
Rel(regForm, customerAPI, "call API", "REST")
Rel(customerLookup, customerAPI, "call API", "REST")
Rel(uploadHandler, documentAPI, "call API", "REST")
Rel(retrievalService, documentAPI, "call API", "REST")

@enduml
```

## Relationships Captured

### Component → Component (RELATES)
- COMP-001 (Registration Form) → COMP-004 (Application Validator)
- COMP-002 (Status Dashboard) → COMP-004 (Application Validator)
- COMP-002 (Status Dashboard) → COMP-005 (Fraud Detector)
- COMP-007 (Upload Handler) → COMP-008 (Retrieval Service)

### Component → Component (CONTAINS)
- COMP-001 (Registration Form) → COMP-003 (Authentication Service)
- COMP-006 (Customer Lookup) → COMP-003 (Authentication Service)

### Component → API (CALLS)
- COMP-001 → API-001 (Customer API)
- COMP-006 → API-001 (Customer API)
- COMP-007 → API-003 (Document API)
- COMP-008 → API-003 (Document API)
