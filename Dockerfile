FROM node

COPY . /home/server/

CMD [ "node", "/home/server/server.js" ]

EXPOSE 3000
