FROM couchbase:latest

COPY init-couchbase.sh /init-couchbase.sh

RUN chmod +x /init-couchbase.sh

ENTRYPOINT ["/init-couchbase.sh"]
