sudo docker rm -f batsh-backend
sudo docker run --detach --name batsh-backend batsh-backend
sudo docker rm -f batsh-frontend
sudo docker run --detach --link batsh-backend:batsh-backend --name batsh-frontend batsh-frontend
