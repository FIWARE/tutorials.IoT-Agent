![FIWARE Banner](https://fiware.github.io/tutorials.IoT-Agent/img/fiware.png)

[![NGSI v2](https://img.shields.io/badge/Ultralight-2.0-pink.svg)](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)


This tutorial introduces the concept of an **IoT Agent** and wires up the dummy [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) IoT devices created in the
[previous tutorial](https://github.com/Fiware/tutorials.Context-Providers/) so that measurements can be read 
and commands can be sent using [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) requests sent to the [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/).

The tutorial uses [cUrl](https://ec.haxx.se/) commands throughout, but is also available as [Postman documentation](http://fiware.github.io/tutorials.IoT-Agent/)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/32975e01a2c250698149)



# Architecture

This application will makes use of two FIWARE component - the [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) and the [IoT Agent for UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/). Usage of the Orion Context Broker is sufficient for an application to qualify as *“Powered by FIWARE”*.
Both the Orion Context Broker and the IoT Agent rely on open source [MongoDB](https://www.mongodb.com/) technology to keep persistence of the information they hold. We will also be using the dummy IoT devices created in the [previous tutorial](https://github.com/Fiware/tutorials.Context-Providers/) 


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