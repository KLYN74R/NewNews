FROM node:16

ENV NODE_ENV production

#Move to own location
WORKDIR /usr/src/NEWNEWS

COPY package*.json ./
COPY . .

#And make it available from everywhere as binary via symlink
RUN npm ci --only=production && mkdir E A M && npm link && chmod +x nn.js && apt update && apt upgrade && apt install nano net-tools

#Traditionally use 8888 as default NewNews port.You can change if you need(but change configs also to run instance)
#Note:You can use external or in-built firewall,ACL and other network polices as you need(and if you know how to do it) 
EXPOSE 8888