# App1 Context Diagram

This shows the dependencies for App1.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

System(app1, "Application 1", "Primary application")
System_Ext(database, "PostgreSQL", "Main database")
System_Ext(redis, "Redis Cache", "Caching layer")

Rel(app1, database, "read and write data", "SQL")
Rel(app1, redis, "fetch cached data", "Redis Protocol")
Rel(redis, database, "subscribe to changes", "PostgreSQL NOTIFY")

@enduml
```
