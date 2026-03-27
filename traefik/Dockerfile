FROM traefik:3.6.12

COPY dynamic/routes.yml /etc/traefik/traefik.yml

CMD [ "traefik", "--configFile=/etc/traefik/traefik.yml" ]