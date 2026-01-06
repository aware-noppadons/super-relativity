FROM neo4j:5.15-community

# Install bash for the init script
USER root
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

# Copy initialization scripts
COPY *.cypher /docker-entrypoint-initdb.d/
COPY init-db.sh /init-db.sh
RUN chmod 755 /init-db.sh && \
    chmod 644 /docker-entrypoint-initdb.d/*.cypher

# Set working directory
WORKDIR /docker-entrypoint-initdb.d

# Default command runs the init script with bash
CMD ["bash", "/init-db.sh"]
