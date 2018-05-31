![FIWARE Banner](https://fiware.github.io/tutorials.IoT-Agent/img/fiware.png)

[![NGSI v2](https://img.shields.io/badge/Ultralight-2.0-pink.svg)](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)


このチュートリアルでは、**IoT Agent** の概念を紹介し、[以前のチュートリアル](https://github.com/Fiware/tutorials.Context-Providers/)で作成したダミーの [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) IoT デバイスを接続し、[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) に送信された [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) リクエストを使用して測定値を読み取り、コマンドを送信できるようにします。

このチュートリアルでは、全体で [cUrl](https://ec.haxx.se/) コマンドを使用していますが、[Postman documentation](http://fiware.github.io/tutorials.IoT-Agent/) も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/32975e01a2c250698149)


# アーキテクチャ

このアプリケーションは、[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) と [IoT Agent for UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/) の2つの FIWARE コンポーネントを使用します。アプリケーションが *“Powered by FIWARE”* と認定されるには、Orion Context Broker を使用するだけで十分です。Orion Context Broker と IoT Agent はオープンソースの MongoDB 技術を利用して、保持している情報の永続性を保ちます。[前のチュートリアル](https://github.com/Fiware/tutorials.Context-Providers/)で作成したダミーの IoT デバイスも使用します。

したがって、全体的なアーキテクチャは次の要素で構成されます :

* [NGSI](http://fiware.github.io/specifications/ngsiv2/latest/) を使用してリクエストを受信する、FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) 
* [NGSI](http://fiware.github.io/specifications/ngsiv2/latest/) を使用してサウス・バウンドのリクエストを受信し、デバイスの [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) コマンドに変換する、FIWARE [IoT Agent for UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/)
* 基礎となる [MongoDB](https://www.mongodb.com/) データベース :
  + **Orion Context Broker** が、データ・エンティティ、サブスクリプション、レジストレーションなどのコンテキスト・データの情報を保持するために使用します
  + **IoT Agent** が、デバイスの URL やキーなどのデバイス情報を保持するために使用します
* コンテキスト・プロバイダの NGSI proxy は次のようになります :
  + [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信します
  + 独自の APIs を独自フォーマットで使用して、公開されているデータソースへのリクエストを行います
  + [NGSI](https://fiware.github.io/specifications/OpenAPI/ngsiv2) 形式でコンテキスト・データを Orion Context Broker に返します
* 在庫管理フロントエンドは以下を行います :
  + 店舗情報を表示します
  + 各店舗で購入できる商品を表示します
  + ユーザが製品を購入して在庫数を減らすことを許可します
* HTTP上で動作する [UltraLight 2.0](http://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) プロトコルを使用して、ダミーの IoT デバイスのセットとして機能するWebサーバ

要素間のすべての対話は HTTP リクエストによって開始されるため、エンティティはコンテナ化され、公開されたポートから実行されます。

![](https://fiware.github.io/tutorials.IoT-Agent/img/architecture.png)


# 次のステップ

アドバンス機能を追加するアプリをもっと複雑にする方法を知りたいですか？ このシリーズの他のチュートリアルを読むことで、学ぶことができます :

&nbsp; 101. [Getting Started](https://github.com/Fiware/tutorials.Getting-Started)<br/>
&nbsp; 102. [Entity Relationships](https://github.com/Fiware/tutorials.Entity-Relationships/)<br/>
&nbsp; 103. [CRUD Operations](https://github.com/Fiware/tutorials.CRUD-Operations/)<br/>
&nbsp; 104. [Context Providers](https://github.com/Fiware/tutorials.Context-Providers/)<br/>
&nbsp; 105. [Altering the Context Programmatically](https://github.com/Fiware/tutorials.Accessing-Context/)<br/> 
&nbsp; 106. [Subscribing to Changes in Context](https://github.com/Fiware/tutorials.Subscriptions/)<br/>

&nbsp; 201. [Introduction to IoT Sensors](https://github.com/Fiware/tutorials.IoT-Sensors/)<br/>
&nbsp; 202. [Provisioning an IoT Agent](https://github.com/Fiware/tutorials.IoT-Agent/)<br/>
