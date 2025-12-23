import React, { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';
import './App.css';

// Apollo Client setup
const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

// GraphQL queries
const GET_APPLICATIONS = gql`
  query GetApplications {
    applications {
      id
      name
      description
      status
      businessCriticality
    }
  }
`;

const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      name
      path
      fileCount
    }
  }
`;

const GET_SYNC_JOBS = gql`
  query GetSyncJobs {
    syncJobs {
      jobId
      status
      recordsSynced
      startedAt
      completedAt
    }
  }
`;

function Dashboard() {
  const [activeTab, setActiveTab] = useState('applications');

  const { loading: appsLoading, error: appsError, data: appsData } = useQuery(GET_APPLICATIONS);
  const { loading: reposLoading, error: reposError, data: reposData } = useQuery(GET_REPOSITORIES);
  const { loading: jobsLoading, error: jobsError, data: jobsData } = useQuery(GET_SYNC_JOBS);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🌌 Super Relativity POC</h1>
        <p>Enterprise Architecture Relationship Discovery Platform</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'applications' ? 'active' : ''}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button
          className={activeTab === 'repositories' ? 'active' : ''}
          onClick={() => setActiveTab('repositories')}
        >
          Repositories
        </button>
        <button
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
        >
          Sync Jobs
        </button>
      </nav>

      <main className="content">
        {activeTab === 'applications' && (
          <div>
            <h2>Applications</h2>
            {appsLoading && <p>Loading applications...</p>}
            {appsError && <p className="error">Error: {appsError.message}</p>}
            {appsData && (
              <div className="card-grid">
                {appsData.applications.map(app => (
                  <div key={app.id} className="card">
                    <h3>{app.name}</h3>
                    <p className="description">{app.description || 'No description'}</p>
                    <div className="badges">
                      <span className={`badge badge-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                      <span className={`badge badge-${app.businessCriticality?.toLowerCase()}`}>
                        {app.businessCriticality}
                      </span>
                    </div>
                  </div>
                ))}
                {appsData.applications.length === 0 && (
                  <p className="empty">No applications found. Run a sync to populate data.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'repositories' && (
          <div>
            <h2>Code Repositories</h2>
            {reposLoading && <p>Loading repositories...</p>}
            {reposError && <p className="error">Error: {reposError.message}</p>}
            {reposData && (
              <div className="list">
                {reposData.repositories.map(repo => (
                  <div key={repo.name} className="list-item">
                    <h3>{repo.name}</h3>
                    <p>{repo.path}</p>
                    <span className="file-count">{repo.fileCount} files</span>
                  </div>
                ))}
                {reposData.repositories.length === 0 && (
                  <p className="empty">No repositories found. Parse code to populate data.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <h2>Sync Jobs</h2>
            {jobsLoading && <p>Loading sync jobs...</p>}
            {jobsError && <p className="error">Error: {jobsError.message}</p>}
            {jobsData && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Status</th>
                      <th>Records</th>
                      <th>Started</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsData.syncJobs.map(job => (
                      <tr key={job.jobId}>
                        <td><code>{job.jobId}</code></td>
                        <td>
                          <span className={`badge badge-${job.status}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>{job.recordsSynced || '-'}</td>
                        <td>{new Date(job.startedAt).toLocaleString()}</td>
                        <td>{job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobsData.syncJobs.length === 0 && (
                  <p className="empty">No sync jobs found yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Neo4j Browser: <a href={process.env.REACT_APP_NEO4J_BROWSER_URL || 'http://localhost:7474'} target="_blank" rel="noopener noreferrer">localhost:7474</a></p>
        <p>GraphiQL: <a href={process.env.REACT_APP_GRAPHQL_URL?.replace('/graphql', '') + '/graphql' || 'http://localhost:4000/graphql'} target="_blank" rel="noopener noreferrer">localhost:4000/graphql</a></p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Dashboard />
    </ApolloProvider>
  );
}

export default App;
