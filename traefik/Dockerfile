FROM traefik:3.6.12

COPY traefik.yml /etc/traefik/traefik.yml

COPY dynamic/routes.yml /etc/traefik/dynamic/routes.yml

RUN mkdir -p /var/traefik \
	&& touch /var/traefik/acme.json \
	&& chmod 600 /var/traefik/acme.json