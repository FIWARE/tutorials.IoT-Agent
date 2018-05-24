![FIWARE Banner](https://fiware.github.io/tutorials.IoT-Agent/img/fiware.png)

[![NGSI v2](https://img.shields.io/badge/Ultralight-2.0-pink.svg)](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)


This tutorial introduces the concept of an **IoT Agent** and wires up the dummy [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) IoT devices created in the
[previous tutorial](https://github.com/Fiware/tutorials.Context-Providers/) so that measurements can be read 
and commands can be sent using [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) requests sent to the [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/).

The tutorial uses [cUrl](https://ec.haxx.se/) commands throughout, but is also available as [Postman documentation](http://fiware.github.io/tutorials.IoT-Agent/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/32975e01a2c250698149)



# Architecture

This application will makes use of two FIWARE component - the [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) and the [IoT Agent for UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/). Usage of the Orion Context Broker is sufficient for an application to qualify as *“Powered by FIWARE”*.
Both the Orion Context Broker and the IoT Agent rely on open source [MongoDB](https://www.mongodb.com/) technology to keep persistence of the information they hold. We will also be using the dummy IoT devices created in the [previous tutorial](https://github.com/Fiware/tutorials.IoT-Sensors/) 


Therefore the overall architecture will consist of the following elements:

* The FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) which will receive requests using [NGSI](http://fiware.github.io/specifications/ngsiv2/latest/)
* The FIWARE [IoT Agent for UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/) which will receive southbound requests using [NGSI](http://fiware.github.io/specifications/ngsiv2/latest/) and convert them to  [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) commands for the devices
* The underlying [MongoDB](https://www.mongodb.com/) database :
  + Used by the **Orion Context Broker** to hold context data information such as data entities, subscriptions and registrations
  + Used by the **IoT Agent** to hold device information such as device URLs and Keys
* The Context Provider NGSI proxy which will will:
  + receive requests using [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2)
  + makes requests to publicly available data sources using their own APIs in a proprietory format 
  + returns context data back to the Orion Context Broker in [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) format.
* The Stock Management Frontend which will will:
  + Display store information
  + Show which products can be bought at each store
  + Allow users to "buy" products and reduce the stock count.
* A webserver acting as set of dummy IoT devices using the [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) protocol running over HTTP.

Since all interactions between the elements are initiated by HTTP requests, the entities can be containerized and run from exposed ports. 

![](https://fiware.github.io/tutorials.IoT-Agent/img/architecture.png)

The necessary configuration information for wiring up the IoT devices and the IoT Agent can be seen in the services section of the associated `docker-compose.yml`  file:

## Dummy IoT Devices Configuration

```yaml
  context-provider:
    image: fiware/cp-web-app:latest
    hostname: context-provider
    container_name: context-provider
    networks:
        - default
    expose:
        - "3000"
        - "3001"
    ports:
        - "3000:3000"
        - "3001:3001"
    environment:
        - "DEBUG=proxy:*"
        - "PORT=3000"
        - "IOTA_HTTP_HOST=iot-agent"
        - "IOTA_HTTP_PORT=7896"
        - "DUMMY_DEVICES_PORT=3001"
        - "DUMMY_DEVICES_API_KEY=4jggokgpepnvsb2uv4s40d59ov"
```

The `context-provider` container is listening on two ports: 

* Port `3000` is exposed so we can see the web-page displaying the Dummy IoT devices.
* Port `3001` is exposed purely for tutorial access - so that cUrl or Postman can make UltraLight commands
  without being part of the same network.


The `context-provider` container is driven by environment variables as shown:

| Key |Value|Description|
|-----|-----|-----------|
|DEBUG|`proxy:*`| Debug flag used for logging |
|PORT|`3000`|Port used by web-app which displays the dummy device data |
|IOTA_HTTP_HOST|`iot-agent`| The host name of the IoT Agent for UltraLight 2.0 - see below | 
|IOTA_HTTP_PORT|`7896` | The port that the IoT Agent for UltraLight 2.0 will be listening on. `7896` is a common default for UltraLight over HTTP |
|DUMMY_DEVICES_PORT|`3001`|Port used by the dummy IoT devices to receive commands |
|DUMMY_DEVICES_API_KEY|`4jggokgpepnvsb2uv4s40d59ov`| Random security key used for UltraLight interactions - used to ensure the integrity of interactions between the devices and the missing IoT Agent |

The other `context-provider` container configuration values described in the YAML file are not used in this tutorial.

## IoT Agent for UltraLight 2.0 Configuration

The [IoT Agent for UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/)  can be instantiated within a Docker container. An offical Docker image is available from [Docker Hub](https://hub.docker.com/r/fiware/iotagent-ul/) tagged `fiware/iotagent-ul`. The 
necessary configuration can be seen below:

```yaml
  iot-agent:
    image: fiware/iotagent-ul:latest
    hostname: iot-agent
    container_name: iot-agent
    depends_on:
      - context-db
      - orion
    networks:
        - default
    expose:
        - "4041"
        - "7896"
    ports:
        - "4041:4041"
        - "7896:7896"
    environment:
        - "IOTA_CB_HOST=orion"
        - "IOTA_CB_PORT=1026"
        - "IOTA_NORTH_PORT=4041"
        - "IOTA_REGISTRY_TYPE=mongodb"
        - "IOTA_LOG_LEVEL=DEBUG"
        - "IOTA_TIMESTAMP=true"
        - "IOTA_MONGO_HOST=context-db"
        - "IOTA_MONGO_PORT=27017"
        - "IOTA_MONGO_DB=iotagentul"
        - "IOTA_HTTP_PORT=7896"
        - "IOTA_PROVIDER_URL=http://iot-agent:4041"
```

The `iot-agent` container relies on the precence of the Orion Context Broker and uses a MongoDB database to hold device information such as device URLs and Keys. The container is listening on two ports: 

* Port `7896` is exposed to receive Ultralight measurements over HTTP from the Dummy IoT devices
* Port `4041` is exposed purely for tutorial access - so that cUrl or Postman can make provisioning commands
  without being part of the same network.


The `iot-agent` container is driven by environment variables as shown:

| Key |Value|Description|
|-----|-----|-----------|
|IOTA_CB_HOST|`orion`| Hostname of the context broker to update context |
|IOTA_CB_PORT|`1026`| Port that context broker listens on to update context |
|IOTA_NORTH_PORT|`4041` | Port used for Configuring the IoT Agent and receiving context updates from the context broker |
|IOTA_REGISTRY_TYPE|`mongodb`| Whether to hold IoT device info in memory or in a database |
|IOTA_LOG_LEVEL|`DEBUG`|The log level of the IoT Agent |
|IOTA_TIMESTAMP|`true`| Whether to supply timestamp information with each measurement received from attached devices |
|IOTA_MONGO_HOST|`context-db`| The host name of mongoDB - used for holding device information |
|IOTA_MONGO_PORT|`27017`| The port mongoDB is listening on |
|IOTA_MONGO_DB|`iotagentul`| The name of the database used in mongoDB |
|IOTA_HTTP_PORT|`7896`| The port where th IoT Agent listens for IoT device traffic over HTTP |
|IOTA_PROVIDER_URL|`http://iot-agent:4041`| URL passed to the Context Broker when commands are registered, used as a forwarding URL location when the Context Broker issues a command to a device | 


# Next Steps

Want to learn how to add more complexity to your application by adding advanced features?
You can find out by reading the other tutorials in this series:

&nbsp; 101. [Getting Started](https://github.com/Fiware/tutorials.Getting-Started)<br/>
&nbsp; 102. [Entity Relationships](https://github.com/Fiware/tutorials.Entity-Relationships/)<br/>
&nbsp; 103. [CRUD Operations](https://github.com/Fiware/tutorials.CRUD-Operations/)<br/>
&nbsp; 104. [Context Providers](https://github.com/Fiware/tutorials.Context-Providers/)<br/>
&nbsp; 105. [Altering the Context Programmatically](https://github.com/Fiware/tutorials.Accessing-Context/)<br/> 
&nbsp; 106. [Subscribing to Changes in Context](https://github.com/Fiware/tutorials.Subscriptions/)<br/>

&nbsp; 201. [Introduction to IoT Sensors](https://github.com/Fiware/tutorials.IoT-Sensors/)<br/>
&nbsp; 202. [Provisioning an IoT Agent](https://github.com/Fiware/tutorials.IoT-Agent/)<br/>