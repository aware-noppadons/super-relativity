FROM neo4j:5.15-community

# Install bash for the init script
USER root
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

# Copy initialization scripts
COPY *.cypher /docker-entrypoint-initdb.d/
COPY init-db.sh /init-db.sh
RUN chmod +x /init-db.sh

# Set working directory
WORKDIR /docker-entrypoint-initdb.d

# Default command runs the init script
CMD ["/init-db.sh"]
