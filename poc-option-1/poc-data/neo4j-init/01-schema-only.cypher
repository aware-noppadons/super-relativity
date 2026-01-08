// ============================================================================
// Super Relativity - Schema Definition Only
// ============================================================================
// This file creates ONLY the schema structure (constraints and indexes).
// NO sample data is included here.
//
// Allowed Node Types:
// - Application, API, BusinessFunction, Component, DataObject, Table,
//   Server, AppChange, InfraChange
//
// Relationship Type: RELATED_TO (with mode and tags properties)
// ============================================================================

// ============================================================================
// CONSTRAINTS (Unique IDs)
// ============================================================================

CREATE CONSTRAINT application_id IF NOT EXISTS
FOR (a:Application) REQUIRE a.id IS UNIQUE;

CREATE CONSTRAINT api_id IF NOT EXISTS
FOR (api:API) REQUIRE api.id IS UNIQUE;

CREATE CONSTRAINT business_function_id IF NOT EXISTS
FOR (bf:BusinessFunction) REQUIRE bf.id IS UNIQUE;

CREATE CONSTRAINT component_id IF NOT EXISTS
FOR (c:Component) REQUIRE c.id IS UNIQUE;

CREATE CONSTRAINT data_object_id IF NOT EXISTS
FOR (d:DataObject) REQUIRE d.id IS UNIQUE;

CREATE CONSTRAINT table_id IF NOT EXISTS
FOR (t:Table) REQUIRE t.id IS UNIQUE;

CREATE CONSTRAINT server_id IF NOT EXISTS
FOR (s:Server) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT app_change_id IF NOT EXISTS
FOR (ac:AppChange) REQUIRE ac.id IS UNIQUE;

CREATE CONSTRAINT infra_change_id IF NOT EXISTS
FOR (ic:InfraChange) REQUIRE ic.id IS UNIQUE;

// ============================================================================
// INDEXES (Performance)
// ============================================================================

// Application Indexes
CREATE INDEX application_name IF NOT EXISTS
FOR (a:Application) ON (a.name);

CREATE INDEX application_lifecycle IF NOT EXISTS
FOR (a:Application) ON (a.lifecycle);

// API Indexes
CREATE INDEX api_name IF NOT EXISTS
FOR (api:API) ON (api.name);

CREATE INDEX api_type IF NOT EXISTS
FOR (api:API) ON (api.type);

// BusinessFunction Indexes
CREATE INDEX business_function_name IF NOT EXISTS
FOR (bf:BusinessFunction) ON (bf.name);

CREATE INDEX business_function_level IF NOT EXISTS
FOR (bf:BusinessFunction) ON (bf.level);

CREATE INDEX business_function_criticality IF NOT EXISTS
FOR (bf:BusinessFunction) ON (bf.criticality);

// Component Indexes
CREATE INDEX component_name IF NOT EXISTS
FOR (c:Component) ON (c.name);

CREATE INDEX component_type IF NOT EXISTS
FOR (c:Component) ON (c.type);

CREATE INDEX component_technology IF NOT EXISTS
FOR (c:Component) ON (c.technology);

// DataObject Indexes
CREATE INDEX data_object_name IF NOT EXISTS
FOR (d:DataObject) ON (d.name);

CREATE INDEX data_object_type IF NOT EXISTS
FOR (d:DataObject) ON (d.type);

CREATE INDEX data_object_sensitivity IF NOT EXISTS
FOR (d:DataObject) ON (d.sensitivity);

// Table Indexes
CREATE INDEX table_name IF NOT EXISTS
FOR (t:Table) ON (t.name);

CREATE INDEX table_database IF NOT EXISTS
FOR (t:Table) ON (t.database);

// Server Indexes
CREATE INDEX server_name IF NOT EXISTS
FOR (s:Server) ON (s.name);

CREATE INDEX server_environment IF NOT EXISTS
FOR (s:Server) ON (s.environment);

CREATE INDEX server_type IF NOT EXISTS
FOR (s:Server) ON (s.type);

// AppChange Indexes
CREATE INDEX app_change_status IF NOT EXISTS
FOR (ac:AppChange) ON (ac.status);

CREATE INDEX app_change_type IF NOT EXISTS
FOR (ac:AppChange) ON (ac.type);

// InfraChange Indexes
CREATE INDEX infra_change_status IF NOT EXISTS
FOR (ic:InfraChange) ON (ic.status);

CREATE INDEX infra_change_type IF NOT EXISTS
FOR (ic:InfraChange) ON (ic.type);

// ============================================================================
// COMPOSITE INDEXES (Query Optimization)
// ============================================================================

CREATE INDEX application_lifecycle_owner IF NOT EXISTS
FOR (a:Application) ON (a.lifecycle, a.owner);

CREATE INDEX server_environment_purpose IF NOT EXISTS
FOR (s:Server) ON (s.environment, s.purpose);

// ============================================================================
// SCHEMA VERIFICATION
// ============================================================================

// Show all constraints
SHOW CONSTRAINTS;

// Show all indexes
SHOW INDEXES;
