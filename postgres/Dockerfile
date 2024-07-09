FROM postgres:16-alpine3.18

COPY ./scripts/shortner.sql /docker-entrypoint-initdb.d/

RUN chmod a+r /docker-entrypoint-initdb.d/*


