services:
  pricing-catalog:
    ... (as before)
  proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"   # maps host 80 to proxy
