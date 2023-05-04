# IoT Agents[<img src="https://img.shields.io/badge/NGSI-LD-d6604d.svg" width="90"  align="left" />](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.06.01_60/gs_CIM009v010601p.pdf)[<img src="https://fiware.github.io/tutorials.IoT-Agent/img/fiware.png" align="left" width="162">](https://www.fiware.org/)<br/>

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://github.com/FIWARE/catalogue/blob/master/iot-agents/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.Iot-Agent.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)
[![JSON LD](https://img.shields.io/badge/JSON--LD-1.1-f06f38.svg)](https://w3c.github.io/json-ld-syntax/)
[![UltraLight 2.0](https://img.shields.io/badge/Payload-Ultralight-27ae60.svg)](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
<br/> [![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

この **NGSI-LD** チュートリアルでは、**IoT Agent** の概念を紹介し、
[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors)で作成したダミー
[UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
IoT デバイスを接続して、
[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) のような NGSI-LD 準拠の Context Broker
に送信された [NGSI-LD](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.06.01_60/gs_CIM009v010601p.pdf)
リクエストを使用して測定値を読み取り、コマンドを送信できるようにします。

このチュートリアルでは、全体で [cUrl](https://ec.haxx.se/) コマンドを使用していますが、
[Postman documentation](https://fiware.github.io/tutorials.IoT-Agent/ngsi-ld.html) も利用できます。

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/fbe8cabce2e1845952db)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/FIWARE/tutorials.IoT-Agent/tree/NGSI-LD)

## コンテンツ

<details>
<summary><strong>詳細</strong></summary>

-   [IoT Agent とは何ですか？](#what-is-an-iot-agent)
    -   [サウスバウンド・トラフィック (コマンド)](#southbound-traffic-commands)
    -   [ノースバウンド・トラフィック (測定値)](#northbound-traffic-measurements)
    -   [共通機能](#common-functionality)
-   [アーキテクチャ](#architecture)
    -   [ダミー IoT デバイスの構成](#dummy-iot-devices-configuration)
    -   [IoT Agent for UltraLight 2.0 の設定](#iot-agent-for-ultralight-20-configuration)
-   [前提条件](#prerequisites)
    -   [Docker](#docker)
    -   [Cygwin](#cygwin)
-   [起動](#start-up)
-   [IoT Agent のプロビジョニング](#provisioning-an-iot-agent)
    -   [IoT Agent サービスの正常性の確認](#checking-the-iot-agent-service-health)
    -   [IoT デバイスの接続](#connecting-iot-devices)
        -   [サービス・グループのプロビジョニング](#provisioning-a-service-group)
        -   [センサのプロビジョニング](#provisioning-a-sensor)
        -   [アクチュエータのプロビジョニング](#provisioning-an-actuator)
        -   [Filling Station (充填ステーション) のプロビジョニング](#provisioning-a-filling-station)
        -   [Tractor FMIS System (トラクター FMIS システム) のプロビジョニング](#provisioning-a-tractor-fmis-system)
    -   [Context Broker コマンドの有効化](#enabling-context-broker-commands)
        -   [Irrigation System (灌漑システム) のアクティブ化](#activating-the-irrigation-system)
        -   [Tractor (トラクター) をアクティブ化](#activating-the-tractor)
        -   [Filling Station (充填ステーション) の有効化](#activating-the-filling-station)
-   [サービス・グループの CRUD アクション](#service-group-crud-actions)
    -   [サービス・グループの作成](#creating-a-service-group)
    -   [サービス・グループの詳細を読み取り](#read-service-group-details)
    -   [すべてのサービス・グループを一覧表示](#list-all-service-groups)
    -   [サービス・グループを更新](#update-a-service-group)
    -   [サービス・グループを削除](#delete-a-service-group)
-   [デバイスの CRUD アクション](#device-crud-actions)
    -   [プロビジョニングされたデバイスの作成](#creating-a-provisioned-device)
    -   [プロビジョニングされたデバイスの詳細を読み取り](#read-provisioned-device-details)
    -   [プロビジョニングされたすべてのデバイスを一覧表示](#list-all-provisioned-devices)
    -   [プロビジョニングされたデバイスを更新](#update-a-provisioned-device)
    -   [プロビジョニングされたデバイスを削除](#delete-a-provisioned-device)

</details>

<a name="what-is-an-iot-agent">

# IoT Agent とは何ですか？

> "Every act of communication is a miracle of translation."
>
> — Ken Liu (The Paper Menagerie and Other Stories)

IoT Agent は、デバイスのグループが独自のネイティブ・プロトコルを使用して Context Broker にデータを送信し、Context
Broker から管理できるようにするコンポーネントです。IoT Agent は、FIWARE プラットフォームのセキュリティの側面
(チャネルの認証と認可) を処理し、他の一般的なサービスをデバイス・プログラマに提供できる必要もあります。

Scorpio, Stellio, Orion などのすべての **NGSI-LD** ベースの Context Broker は、明確に定義された NGSI-LD
インターフェイスを排他的に使用します。このインターフェイスは、サードパーティからの指示を受信するときや、
Context Broker 自体の周囲の **NGSI-LD** 対応コンポーネントと通信するときにも使用されます。IoT Agent
のノースポートは、**NGSI-LD** を使用して通信できるコンポーネントの1つであり、IoT Agent は結果を変換し、
接続されたデバイスの**ネイティブ・プロトコル**を使用して、このポートの下のすべての対話が行われるようにします。

実際、これにより、コンテキスト情報管理レベルですべての IoT インタラクションに標準インターフェースが提供されます。
関連する IoT Agent がこの複雑さを処理するためのファサード・パターン (a facade pattern) を提供する一方で、IoT
デバイスの各グループは、自身の独自のプロトコルと異なるトランスポート・メカニズムを内部で使用できます。

IoT Agent は、多くの IoT 通信プロトコルとデータモデル用にすでに対応しているものや、開発中のものもあります。
例は次のとおりです:

-   [IoTAgent-JSON](https://fiware-iotagent-json.readthedocs.io/en/latest/) - HTTP/MQTT メッセージング (JSON
    ペイロードを使用) と NGSI-LD 間のブリッジ
-   [IoTAgent-LWM2M](https://fiware-iotagent-lwm2m.readthedocs.io/en/latest) -
    [Lightweight M2M](https://www.omaspecworks.org/what-is-oma-specworks/iot/lightweight-m2m-lwm2m/) プロトコルと
    NGSI-LD 間のブリッジ
-   [IoTAgent-UL](https://fiware-iotagent-ul.readthedocs.io/en/latest) - HTTP/MQTT メッセージング (UltraLight2.0
    ペイロードを使用) と NGSI-LD 間のブリッジ
-   [IoTagent-LoRaWAN](https://fiware-lorawan.readthedocs.io/en/latest) -
    [LoRaWAN](https://www.thethingsnetwork.org/docs/lorawan/) プロトコルと NGSI-LD 間のブリッジ

<a name="southbound-traffic-commands">

## サウスバウンド・トラフィック (コマンド)

Context Broker から生成され、IoT Agent を介して、IoT デバイスに向けて下向きに渡された HTTP リクエストは、
サウスバウンド・トラフィックと呼ばれます。サウスバウンドのトラフィックは、アクチュエータ・デバイスに対して行われた
**コマンド**で構成されており、それらのアクションによって現実世界の状態を変更します。

たとえば、実際の Ultra Light 2.0 **Irrigation System** (灌漑システム) をオンに切り替えるには、次
のようなやりとりが発生します :

1.  **Context Broker** に NGSI-LD PATCH リクエストが送信され、**Irrigation System** の現在のコンテキストが更新されます

-   これは事実上、**Irrigation System**の `on` コマンドを呼び出す間接的なリクエストです

2.  **Context Broker** は、コンテキスト内でエンティティを見つけ、この属性のコンテキスト・プロビジョニングは
    **IoT Agnet** に委任されていることを見つけます
3.  標準のフォワーディング・メカニズムを使用して、**Context broker** は PATCH リクエストを複製し、それを
    **IoT Agent** のノース・ポートに転送してコマンドを呼び出します
4.  **IoT Agent** はこのサウスバウンド・リクエストを受信し、UltraLight 2.0 構文に変換して、**Irrigation System** に渡します
5.  **Irrigation System** は Water sprinkler をオンにして、コマンドの結果を UltraLight 2.0 構文で **IoT Agent**
    に返します
6.  **IoT Agent** はこのノースバウンド・リクエストを受信し、解釈して、NGSI-LD リクエストを **Context Broker**
    に送信することで、インタラクションの結果をコンテキストに渡します。
7.  **Context Broker** はこのノースバウンド・リクエストを受け取り、コマンドの結果でコンテキストを更新します

![](https://fiware.github.io/tutorials.IoT-Agent/img/command-swimlane.png)

-   **ユーザ**と **Context Broker** 間のリクエストは NGSI-LD を使用します
-   **Context Broker** と **IoT Agent** 間のリクエストは NGSI-LD を使用します
-   **IoT Agent** と **IoT Device** 間のリクエストはネイティブ・プロトコルを使用します
-   **IoT Device** と **IoT Agent** 間のリクエストはネイティブ・プロトコルを使用します
-   **IoT Agent** と **Context Broker** 間のリクエストは NGSI-LD を使用します

<a name="northbound-traffic-measurements">

## ノースバウンド・トラフィック (測定値)

IoT デバイスから生成され、IoT Agent を介して、Context Broker に向かって上方に渡されるリクエストは、ノースバウンド・
トラフィックと呼ばれます。ノースバウンド・トラフィックは、センサ・デバイスによる**測定値**で構成され、
現実世界の状態をシステムのコンテキスト・データに中継します。

たとえば、実際の  **Soil Sensor** (土壌センサ) が湿度の測定値を送信する場合、次の相互作用が発生します:

1.  **Soil Sensor** は測定を行い、**IoT Agent** に結果をパスします
2.  **IoT Agent** は、このノースバウンド・リクエストを受信し、UltraLight 構文からの結果を変換し、**Context Broker**
    に NGSI-LD リクエストを行うことにより、インタラクションの結果をコンテキストに渡します
3.  **Context Broker** はこのノースバウンド・リクエストを受け取り、測定結果でコンテキストを更新します

![](https://fiware.github.io/tutorials.IoT-Agent/img/measurement-swimlane.png)

-   **IoT デバイス** と **IoT Agent** 間のリクエストはネイティブ・プロトコルを使用します
-   **IoT Agent** と **Context-Broker** 間のリクエストは NGSI-LD を使用します

> **注** 他のより複雑なインタラクションも可能ですが、この概要は IoT Agent の基本原理を理解するには十分です。

<a name="common-functionality">

## 共通機能

前のセクションからわかるように、各 IoT Agent は異なるプロトコルを解釈するので一意になりますが、IoT Agent
の間にはかなりの類似性があります。

-   デバイスの更新をリッスンする標準エンドポイントを提供
-   コンテキスト・データの更新をリッスンする標準エンドポイントを提供
-   デバイスのリストを保持し、コンテキスト・データの属性をデバイス構文にマッピング
-   セキュリティ認証

この基本機能は、共通の
[IoT Agent framework library](https://iotagent-node-lib.readthedocs.io/)
に抽象化されてい ます。

#### デバイス・モニタ

このチュートリアルでは、Context Broker に接続される一連のダミー農業用 IoT デバイスを作成しました。使用される
アーキテクチャとプロトコルの詳細は、 IoT センサのチュートリアルにあります。各デバイスの状態は、次の URL
にある UltraLight デバイス・モニタの Web ページで確認できます: `http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io/tutorials.IoT-Agent/img/farm-devices.png)

<a name="architecture">

# アーキテクチャ

このアプリケーションは、[以前のチュートリアル](https://github.com/FIWARE/tutorials.Subscriptions/)
で作成したコンポーネントに基づいて構築されています。
[Orion](https://fiware-orion.readthedocs.io/en/latest/) などの NGSI-LD Context Broker と
[UltraAgent 2.0のIoT Agent](https://fiware-iotagent-ul.readthedocs.io/en/latest/) の2つの FIWARE
コンポーネントを使用します。アプリケーションが _“Powered by FIWARE”_ として認定されるには、Context Broker
の使用で十分です。Orion Context Broker と IoT Agent はどちらも、オープンソース [MongoDB](https://www.mongodb.com/)
テクノロジを利用して、保持している情報の永続性を維持しています。
[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors/) で作成したダミー IoT デバイスも使用します。

したがって、全体的なアーキテクチャは次の要素で構成されます:

-   [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) は、
    [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json)
    を使用してリクエストを受信します
-   FIWARE [IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) は、
    [NGSI-LD](https://forge.etsi.org/swagger/ui/?url=https://forge.etsi.org/rep/NGSI-LD/NGSI-LD/raw/master/spec/updated/generated/full_api.json)
    を使用してサウスバウンド・リクエストを受信し、それらをデバイスの
    [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
    コマンドに変換します
-   基礎となる [MongoDB](https://www.mongodb.com/) データベース :
    -   **Orion Context Broker** が、データ・エンティティ、サブスクリプション、レジストレーションなどの
        コンテキスト・データの情報を保持するために使用します
    -   **IoT Agent** が、デバイスの URLs やキーなどのデバイス情報を保持するために使用します
-   **チュートリアル・アプリケーション**は、以下のことを行います:
    -   HTTP を介して実行される
        [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
        プロトコルを使用して、ダミーの農業 IoT デバイスのセットとして機能します

要素間のすべての対話は HTTP リクエストによって開始されるため、エンティティをコンテナ化して、
公開されたポートから実行できます。

![](https://fiware.github.io/tutorials.IoT-Agent/img/architecture-ld.png)

IoT デバイスと IoT Agent を関連付けるために必要な構成情報は、関連する `docker-compose.yml` ファイルの
`services` セクションで確認できます:

<a name="dummy-iot-devices-configuration">

## ダミー IoT デバイスの設定

```yaml
tutorial:
    image: quay.io/fiware/tutorials.ngsi-ld
    hostname: iot-sensors
    container_name: fiware-tutorial
    networks:
        - default
    expose:
        - "3000"
        - "3001"
    ports:
        - "3000:3000"
        - "3001:3001"
    environment:
        - "DEBUG=tutorial:*"
        - "PORT=3000"
        - "IOTA_HTTP_HOST=iot-agent"
        - "IOTA_HTTP_PORT=7896"
        - "DUMMY_DEVICES_PORT=3001"
        - "DUMMY_DEVICES_API_KEY=4jggokgpepnvsb2uv4s40d59ov"
        - "DUMMY_DEVICES_TRANSPORT=HTTP"
        - "IOTA_JSON_LD_CONTEXT=http://context/ngsi-context.jsonld"
```

`tutorial` コンテナは、2つのポートでリッスンしています:

-   ポート`3000` が公開されているので、ダミー IoT デバイスを表示する Web ページが表示されます
-   ポート`3001` は純粋にチュートリアルのアクセスのために公開されているため、cUrl または
    Postman は同じネットワークに属さなくても、UltraLight コマンドを作成できます

`tutorial` コンテナは、次のように環境変数によって駆動されます :

| キー                    | 値                                                    | 説明                                                                                                                                             |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| DEBUG                   | `tutorial:*`                                          | ロギングに使用するデバッグ・フラグ                                                                                                               |
| WEB_APP_PORT            | `3000`                                                | ダミー・デバイスのデータを表示する web-app が使用するポート                                                                                      |
| IOTA_HTTP_HOST          | `iot-agent`                                           | Ultra Light 2.0 用 IoT Agent のホスト名 - 下記を参照                                                                                             |
| IOTA_HTTP_PORT          | `7896`                                                | Ultra Light 2.0 の IoT Agent がリッスンするポート。`7896` は、Ultra Light over HTTP の一般的なデフォルトです                                     |
| DUMMY_DEVICES_PORT      | `3001`                                                | コマンドを受信するためにダミー IoT デバイスが使用するポート                                                                                      |
| DUMMY_DEVICES_API_KEY   | `4jggokgpepnvsb2uv4s40d59ov`                          | UltraLight インタラクションに使用されるランダムなセキュリティキー - デバイスと IoT Agent 間のインタラクションの完全性を保証するために使用します |
| DUMMY_DEVICES_TRANSPORT | `HTTP`                                                | ダミー IoT デバイスによって使用されるトランスポート・プロトコル                                                                                  |
| IOTA_JSON_LD_CONTEXT    | `http://context/ngsi-context.jsonld` | デバイスのデータモデルの定義に使用される `@context` ファイルの場所                                                                               |

このチュートリアルでは、YAML ファイルで説明されている他の `tutorial` コンテナの設定値は使用しません。

<a name="iot-agent-for-ultralight-20-configuration">

## IoT Agent for UltraLight 2.0 の設定

[IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) の IoT Agent は、Docker
コンテナ内でインスタンス化できます。`fiware/iotagent-ul` とタグ付けされた
[Docker Hub](https://hub.docker.com/r/fiware/iotagent-ul/) から公式の Docker イメージを入手できます。
必要な設定は次のとおりです:

```yaml
iot-agent:
    image: quay.io/fiware/iotagent-ul:latest
    hostname: iot-agent
    container_name: fiware-iot-agent
    depends_on:
        - mongo-db
    networks:
        - default
    expose:
        - "4041"
        - "7896"
    ports:
        - "4041:4041"
        - "7896:7896"
    environment:
        - IOTA_CB_HOST=orion
        - IOTA_CB_PORT=1026
        - IOTA_NORTH_PORT=4041
        - IOTA_REGISTRY_TYPE=mongodb
        - IOTA_LOG_LEVEL=DEBUG
        - IOTA_TIMESTAMP=true
        - IOTA_CB_NGSI_VERSION=ld
        - IOTA_AUTOCAST=true
        - IOTA_MONGO_HOST=mongo-db
        - IOTA_MONGO_PORT=27017
        - IOTA_MONGO_DB=iotagentul
        - IOTA_HTTP_PORT=7896
        - IOTA_PROVIDER_URL=http://iot-agent:4041
        - IOTA_JSON_LD_CONTEXT=http://context/ngsi-context.jsonld
        - IOTA_FALLBACK_TENANT=openiot
```

`iot-agent` コンテナは、Orion Context Broker の存在に依存し、MongoDB データベースを使用して、デバイスの
URLs やキーなどのデバイス情報を保持します。コンテナは2つのポートでリッスンしています:

-   ポート `7896` は、ダミー IoT デバイスから HTTP 経由で Ultralight 測定値を受信するためにポートが公開されています
-   ポート `4041` は純粋にチュートリアル・アクセス用に公開されているため、cUrl または Postman
    は同じネットワークに属さなくてもプロビジョニング・コマンドを実行できます

`iot-agent` コンテナは、以下に示すような環境変数によって駆動されます:

| キー                 | 値                                                   | 説明                                                                                                                                                |
| -------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| IOTA_CB_HOST         | `orion`                                              | コンテキストを更新する Context Broker のホスト名                                                                                                    |
| IOTA_CB_PORT         | `1026`                                               | Context Broker がコンテキストを更新するためにリッスンするポート                                                                                     |
| IOTA_NORTH_PORT      | `4041`                                               | IoT Agent の設定および Context Broker からのコンテキスト更新の受信に使用されるポート                                                                |
| IOTA_REGISTRY_TYPE   | `mongodb`                                            | メモリまたはデータベースに IoT デバイス情報を保持するかどうかを指定                                                                                |
| IOTA_LOG_LEVEL       | `DEBUG`                                              | IoT Agent のログレベル                                                                                                                              |
| IOTA_TIMESTAMP       | `true`                                               | 接続されたデバイスから受信した各測定値にタイムスタンプ情報を提供するかどうかを指定                                                                  |
| IOTA_CB_NGSI_VERSION | `LD`                                                 | アクティブな属性の更新を送信するときに NGSI-LD を使用するように指定するかどうか                                                                    |
| IOTA_AUTOCAST        | `true`                                               | Ultralight の数値が文字列ではなく数値として読み取られるようにする                                                                                   |
| IOTA_MONGO_HOST      | `context-db`                                         | mongoDB のホスト名 - デバイス情報を保持するために使用                                                                                               |
| IOTA_MONGO_PORT      | `27017`                                              | mongoDB がリッスンしているポート                                                                                                                    |
| IOTA_MONGO_DB        | `iotagentul`                                          | mongoDB で使用されるデータベースの名前                                                                                                             |
| IOTA_HTTP_PORT       | `7896`                                                | IoT Agent が HTTP 経由で IoT デバイスのトラフィックをリッスンするポート                                                                            |
| IOTA_PROVIDER_URL    | `http://iot-agent:4041`                               | コマンドが登録されたときに Context Broker に渡された URL。Context Broker がデバイスにコマンドを発行したときにフォワーディング URL の場所として使用 |
| IOTA_JSON_LD_CONTEXT | `http://context/ngsi-context.jsonld` | デバイス・データモデルの定義に使用される `@context` ファイルの場所                                                                                |
| IOTA_FALLBACK_TENANT | `openiot`                                             | 明示的なテナントが通信から受信されていない場合に使用するテナント                                                                                   |

<a name="prerequisites">

# 前提条件

<a name="docker">

## Docker

物事を単純にするために、両方のコンポーネントが [Docker](https://www.docker.com) を使用して実行されます。**Docker**
は、さまざまコンポーネントをそれぞれの環境に分離することを可能にするコンテナ・テクノロジです。

-   Docker を Windows にインストールするには
    、[こちら](https://docs.docker.com/docker-for-windows/)の手順に従ってくださ
    い
-   Docker を Mac にインストールするには
    、[こちら](https://docs.docker.com/docker-for-mac/)の手順に従ってください
-   Docker を Linux にインストールするには
    、[こちら](https://docs.docker.com/install/)の手順に従ってください

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです。
[YAML file](https://raw.githubusercontent.com/FIWARE/tutorials.IoT-Agent/NGSI-LD/docker-compose/orion-ld.yml)
ファイルは、アプリケーションのために必要なサービスを構成するために使用します。つまり、すべてのコンテナ・サービスは
1 つのコマンドで呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows と Docker for Mac
の一部としてインストールされますが、Linux ユーザは[ここ](https://docs.docker.com/compose/install/)
に記載されている手順に従う必要があります。

次のコマンドを使用して、現在の **Docker** バージョンと **Docker Compose** バージョンを確認できます :

```console
docker-compose -v
docker version
```
Docker バージョン 20.10 以降と Docker Compose 1.29 以上を使用していることを確認し、
必要に応じてアップグレードしてください。

<a name="cygwin">

## Cygwin

シンプルな bash スクリプトを使用してサービスを開始します。Windows ユーザは [cygwin](http://www.cygwin.com/)
をダウンロードして、Windows 上の Linux ディストリビューションと同様のコマンドライン機能を提供する必要があります。

<a name="start-up">

# 起動

開始する前に、必要な Docker イメージをローカルで取得またはビルドしたことを確認する必要があります。
以下のコマンドを実行して、リポジトリのクローンを作成し、必要なイメージを作成してください:

```console
git clone https://github.com/FIWARE/tutorials.IoT-Agent.git
cd tutorials.IoT-Agent
git checkout NGSI-LD

./services create
```

その後、リポジトリ内で提供される [services](https://github.com/FIWARE/tutorials.IoT-Agent/blob/NGSI-LD/services)
Bash script を実行することにより、コマンドラインからすべてのサービスを初期化できます:

```console
git clone https://github.com/FIWARE/tutorials.IoT-Agent.git
cd tutorials.IoT-Agent
git checkout NGSI-LD

./services orion|scorpio
```

> :information_source: **注:** クリーンアップしてやり直す場合は、次のコマンドを実行してください
>
> ```console
> ./services stop
> ```

<a name="provisioning-an-iot-agent">

# IoT Agent のプロビジョニング

チュートリアルを正しく実行するには、ブラウザでデバイス・モニタのページを使用できることを確認し、ページをクリックして
オーディオを有効にしてから、cUrl コマンドを入力してください。 デバイス・モニタは、Ultralight 2.0 構文を使用して
ダミー・デバイスの配列の現在の状態を表示します。

#### デバイス・モニタ

デバイス・モニタは次の場所にあります: `http://localhost:3000/device/monitor`

<a name="checking-the-iot-agent-service-health">

## IoT Agent サービスの正常性の確認

公開されたポートに HTTP リクエストを送信することで、IoT Agent が実行されているかどうかを確認できます:

#### :one: リクエスト:

```console
curl -X GET \
  'http://localhost:4041/iot/about'
```

レスポンスは次のようになります:

```json
{
    "libVersion": "2.12.0-next",
    "port": "4041",
    "baseRoot": "/",
    "version": "1.13.0-next"
}
```

> **`Failed to connect to localhost port 4041: Connection refused` のレスポンスを受け取ったらどうしますか？**
>
> `Connection refused` のレスポンスを受け取った場合、IoT Agent がこのチュートリアルで期待される場所に
> 見つからないためです。各 cUrl コマンドの URL とポートを訂正された IP アドレスで置き換える必要があります。
> すべての cUrl コマンドのチュートリアルでは、IoT Agent が `localhost:4041` で使用可能であると想定しています
> 。
>
> 以下の対策を試してください:
>
> -   Docker コンテナが動作していることを確認するには、次のようにしてください:
>
> ```console
> docker ps
> ```
>
> 実行中の 4 つのコンテナが表示されます。IoT Agent が実行されていない場合は、必要に応じてコンテナを
> 再起動できます。このコマンドは、開いているポート情報も表示します。
>
> -   [`docker-machine`](https://docs.docker.com/machine/) と [Virtual Box](https://www.virtualbox.org/)
>     をインストールした場合、Context Broker, IoT Agent, IoT Agnet とダミー・デバイスの Docker コンテナが別の
>     IP アドレスから実行されている可能性があります:
>
> ```console
> curl -X GET \
>  'http://$(docker-machine ip default):4041/version'
> ```
>
> または、コンテナ・ネットワーク内からすべての curl コマンドを実行します:
>
> ```console
> docker run --network fiware_default --rm appropriate/curl -s \
>  -X GET 'http://iot-agent:4041/iot/about'
> ```

<a name="connecting-iot-devices">

## IoT デバイスの接続

IoT Agentは、IoT デバイスと Context Broker 間のミドルウェアとして機能します。 したがって、一意の ID
を持つコンテキスト・データ・エンティティを作成できる必要があります。サービスがプロビジョニングされ、不明なデバイスが
測定を行うと、IoT Agent はこれを標準の `urn:ngsi-ld:` プレフィックス、デフォルトの `type` および指定された `<device-id>`
を使用してコンテキストに追加します (デバイスが認識され、既知の ID にマップできる場合を除きます）。

**NGSI-LD** の場合、各デバイス・エンティティのすべての属性の定義は、提供された `@context` ファイルで利用できるように
する必要があります。ベースの**デバイス**のスマート・データモデルは
[こちら](https://swagger.lab.fiware.org/?url=https://fiware.github.io/tutorials.NGSI-LD/swagger/device.yaml)です。
この検出可能性とサードパーティ・システムとの相互運用性を可能にするには、IoT Agent に、リクエストごとに
Context Broker に再送信される `@context` ファイルの場所を保持する `IOTA_JSON_LD_CONTEXT`
環境変数を事前に提供する必要があります。

提供されるすべての IoT デバイス `<device-id>` が常に一意であるという保証はありません。そのため、IoT Agent
へのすべてのプロビジョニング・リクエストには2つの必須ヘッダが必要です:

-   `fiware-service` ヘッダ (`NGSILD-Tenant` と同等) は、特定のサービスのエンティティを別の mongoDB データベースに
    保持できるように定義されています
-   `fiware-servicepath` は、デバイスのアレイを区別するために使用できます

**NGSI-LD** IoT Agent は **NGSI-v2** と下位互換性があるため、現在プロビジョニング時に古い FIWARE ヘッダの名前を
使用していることに注意してください。

たとえば、スマート・シティ・アプリケーションでは、部門ごとに異なる `fiware-service` ヘッダ (公園、交通機関、ごみ収集など)
が想定され、各 `fiware-servicepath` は特定の公園などを参照します。つまり、各サービスのデータとデバイスは、必要に応じて
識別および分離できますが、データはサイロ化されません。たとえば、公園内の **Smart Bin** からのデータを **GPS Unit**
と組み合わせて、効率的な方法でトラックのルートを変更できます。

**Smart Bin** と **GPS Unit** は、さまざまなメーカーから提供される可能性が高く、使用される `<device-id>`
内で重複がないことが保証されません。`fiware-service` および `fiware-servicepath` ヘッダを使用すると、
これが常に当てはまり、Context Broker がコンテキスト・データの元のソースを識別できるようになります。

<a name="provisioning-a-service-group">

### サービス・グループのプロビジョニング

各プロビジョニングで常に認証キーを提供する必要があり、IoT Agent は最初に Context Broker がレスポンスしている URL
を認識しないため、グループ・プロビジョニングの呼び出しは常にデバイス接続の最初のステップです。

すべての匿名デバイスに対してデフォルトのコマンドと属性を設定することも可能ですが、このチュートリアルでは、
各デバイスを個別にプロビジョニングするため、これは行いません。

この例では、デバイスの匿名グループをプロビジョニングします。 一連のデバイスは、 IoT Agentが**ノースバウンド**通信を
リッスンしている `IOTA_HTTP_PORT` にメッセージを送信することを IoT Agent に通知します。

#### :two: リクエスト:

```console
curl -iX POST 'http://localhost:4041/iot/services' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /' \
-H 'Content-Type: application/json' \
--data-raw '{
    "services": [
        {
            "apikey": "4jggokgpepnvsb2uv4s40d59ov",
            "cbroker": "http://orion:1026",
            "entity_type": "Device",
            "resource": "/iot/d",
            "attributes": [
                {
                    "object_id": "bpm", "type": "Property", "name": "heartRate",
                    "metadata": { "unitCode": {"type": "Text", "value": "5K" }}
                },
                {
                    "object_id": "s", "name": "status", "type": "Property"
                },
                {
                    "object_id": "gps", "name": "location", "type": "geo:point"
                }
            ],
            "static_attributes": [
                {
                    "name": "category", "type": "Property", "value": "sensor"
                },
                {
                    "name": "supportedProtocol", "type": "Property", "value": "ul20"
                }
            ]
        }
    ]
}'
```

この例では、IoT Agent に、`/iot/d` エンドポイントが使用され、デバイスがトークン `4jggokgpepnvsb2uv4s40d59ov`
を含めることによって、自身を認証することが通知されます。UltraLight IoT Agent の場合、これはデバイスが GET または
POST リクエストを以下に送信することを意味します:

```
http://iot-agent:7896/iot/d?i=<device_id>&k=4jggokgpepnvsb2uv4s40d59ov
```

[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-LD)で、
UltraLight 2.0 構文に慣れているはずです。

サービス・グループのプロビジョニングは、`attributes` マッピングと一般的な `static_attributes` を定義するためにも
使用できます。`attributes` マッピングは、匿名の着信デバイスの一般的なエイリアスを定義します。たとえば、キー `gps`
は、`location` GeoProperty をマップするように定義できます。

IoT デバイスからの測定値がリソース URL で受信されると、それを解釈して Context Broker に渡す必要があります。
`entity_type` 属性は、リクエストを行った各デバイスのデフォルトの `type` を提供します (この場合、匿名デバイスは
`Device` エンティティと呼ばれます。さらに、Context Broker (`cbroker`) の場所が必要です。これは、IoT Agent
が受信した測定値を正しい場所に渡すことができるようにします。`cbroker` はオプションの属性です。提供されない場合、
IoT Agent は設定ファイルで定義された Context Broker URL を使用しますが、完全を期すためにここに含めています。

<a name="provisioning-a-sensor">

### センサのプロビジョニング

NGSI-LD [specification](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.06.01_60/gs_CIM009v010601p.pdf)
は、コンテキスト・データ・エンティティの作成時に完全な URNs を要求しますが、デバイスからの着信メッセージはこの規則を
認識しません。 さらに、コンテキスト・データ・エンティティの属性名は、関連付けられた `@context` ファイル内にある短い名前と
一致する必要があります。これらのマッピングは、前のリクエストに見られるようにサービス・グループ・レベルで定義するか、
各デバイスを個別にプロビジョニングして定義できます。

3種類の測定属性をプロビジョニングできます:

-   `attributes` は、デバイスからのアクティブな読み取り値のマッピングです
-   `lazy` 属性はリクエスト時にのみ送信されます。IoT Agent はデバイスに測定値を返すよう通知します
-   `static_attributes` は、名前が示すように、Context Broker に渡されるデバイス (Relationships など)
     に関する静的データです

> **注**: 個々の `id` が必要ない場合、または集約されたデータで十分な場合、`attributes` は個別ではなく
> プロビジョニング・サービス内で定義できます。

#### :three: リクエスト:

```console
curl -L -X POST 'http://localhost:4041/iot/devices' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -H 'Content-Type: application/json' \
--data-raw '{
  "devices": [
    {
      "device_id": "temperature001",
      "entity_name": "urn:ngsi-ld:Device:temperature001",
      "entity_type": "Device",
      "timezone": "Europe/Berlin",
      "attributes": [
        {
          "object_id": "t",
          "name": "temperature",
          "type": "Property",
          "metadata": {
            "unitCode": {
              "type": "Text",
              "value": "CEL"
            }
          }
        }
      ],
      "static_attributes": [
        {
          "name": "controlledAsset",
          "type": "Relationship",
          "value": "urn:ngsi-ld:Building:barn001"
        }
      ]
    }
  ]
}'
```

リクエストでは、デバイス `temperature001` を URN `urn:ngsi-ld:Device:temperature001` に関連付け、 `t`
を読み取るデバイスを (適切なメタデータを含む **Property**として定義されている) コンテキスト属性 `temperature`
にマッピングしています。`controlledAsset` **Relationship** も `static_attribute` として定義され、デバイスを
**Building** `urn:ngsi-ld:Building:barn001` 内に配置します

> 静的属性 (static attributes) は、`q` パラメータを使用したクエリを有効にするエンティティの追加データとして役立ちます。
> たとえば、Smart Data Models [Device](https://github.com/smart-data-models/dataModel.Device/blob/master/Device/doc/spec.md)
> モデルは、`category` や `controledProperty` などの属性を定義します。これにより、次のようにクエリを実行できます:
>
> -   _現在 `batteryLevel` が低い **Actuators** はどれですか？_
>
> `/ngsi-ld/v1/entities?q=category=="actuator";batteryLevel<0.1`
>
> -   _2020年1月より前にインストールされた `fillingLevel` を測定する **Devices** はどれですか？_
>
> `/ngsi-ld/v1/entities?q=controlledProperty=="fillingLevel";dateInstalled<"2020-01-25T00:00:00.000Z"`
>
> 明らかに、静的データは必要に応じて拡張でき、エンティティ ID がクエリに対して柔軟性がない場合は、デバイスごとに一意
> の `name` や `serialNumber` などの追加データを含めることもできます。
>
> `/ngsi-ld/v1/entities?q=serialNumber=="XS403001-002"`
>
> さらに、固定の `location` 静的属性を持つデバイスは、ジオフェンス・パラメータを使用してクエリすることもできます。
>
> `/ngsi-ld/v1/entities?georel=near;maxDistance:1500&geometry=point&coords=52.5162,13.3777`

次のリクエストを行うことで、**Temperature Sensor** デバイス `temperature001` からのダミー IoT
デバイス測定をシミュレートできます。

#### :four: リクエスト:

```console
curl -L -X POST 'http://localhost:7896/iot/d?k=4jggokgpepnvsb2uv4s40d59ov&i=temperature001' \
    -H 'Content-Type: text/plain' \
    --data-raw 't|3'
```

以前のチュートリアルで (IoT Agent が接続される前に) 同様のリクエストが行われ、スプリンクラー・システムがアクティブ化
されたときに、各センサの状態が変化し、ノースバウンド・リクエストがデバイス・モニタに記録されます。

このチュートリアルでは、IoT Agent が接続されたので、サービス・グループは IoT Agent がリッスンしているエンドポイント
(`/iot/d`) とリクエストの認証に使用される API キー (`4jggokgpepnvsb2uv4s40d59ov`) を定義しました。
これらは両方ともリクエストから認識されるため、測定は有効です。

デバイス (`temperature001`) を特別にプロビジョニングしたため、IoT Agent は Orion Context Broker
でリクエストを発生させる前に属性をマップできます。

Context Broker からエンティティ・データを取得すると、測定値が記録されていることがわかります。
`fiware-service` および `fiware-service-path` ヘッダを追加することを忘れないでください。

#### :five: リクエスト:

```console
curl -G -iX GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:temperature001' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
    -d 'attrs=temperature'
```

#### レスポンス:

```jsonld
{
    "@context": "http://context/ngsi-context.jsonld",
    "id": "urn:ngsi-ld:Device:temperature001",
    "type": "Device",
    "temperature": {
        "type": "Property",
        "value": "3",
        "unitCode": "CEL",
        "observedAt": "2020-09-14T15:23:12.263Z"
    }
}
```

レスポンスは、`id=temperature001` の **Temperature Sensor** デバイスが IoT Agent によって正常に識別され、
エンティティ `id=urn:ngsi-ld:Device:temperature001` にマッピングされたことを示しています。この新しいエンティティは、
コンテキスト・データ内に作成されています。ダミー・デバイス測定リクエストの `t` 属性は、コンテキスト内でより意味のある
`temperature` 属性にマッピングされています。気づくと思いますが、`observedAt` 属性が属性のメタデータに追加されました。
これは、エンティティと属性が最後に更新された時間を表し、`IOTA_TIMESTAMP` 環境変数が設定されているため、IoT Agent
が起動したとき、新しい各エンティティに自動的に追加されます。

サービス・グループをプロビジョニングすることで、IoT Agent をオープンして、匿名のデバイスから測定値を受け取ることも
できます。たとえば、必要なすべてのデータがデバイス自体から直接利用できる場合、個々のデバイスをプロビジョニングする
必要はありません。

たとえば、 `/iot/d` エンドポイントへのこのリクエストを考えてみましょう:

#### :six: リクエスト:

```console
curl -iX POST 'http://localhost:7896/iot/d?k=4jggokgpepnvsb2uv4s40d59ov&i=motion003' \
-H 'Content-Type: text/plain' \
--data-raw 'c|1'
```

リソース・エンドポイントはサービス・グループ内で以前に定義されており、API キーが一致するため、これは有効な測定として
認識され、サービス・エンティティの知識に基づいて属性がマッピングされた新しいエンティティが Context Broker
に作成されます。

#### :seven: リクエスト:

```console
curl -L -X GET 'http://localhost:1026/ngsi-ld/v1/entities/?type=Device' \
-H 'NGSILD-Tenant: openiot' \
-H 'NGSILD-Path: /' \
-H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
```

#### レスポンス:

```jsonld
[
    {
        "@context": "http://context/ngsi-context.jsonld",
        "id": "urn:ngsi-ld:Device:motion003",
        "type": "Device",
        "c": {
            "type": "Property",
            "value": "1",
            "observedAt": "2020-09-17T09:41:56.755Z"
        },
        "category": {
            "type": "Property",
            "value": "sensor",
            "observedAt": "2020-09-17T09:41:56.755Z"
        },
        "supportedProtocol": {
            "type": "Property",
            "value": "ul20",
            "observedAt": "2020-09-17T09:41:56.755Z"
        }
    }
]
```

ご覧のとおり、サービス・グループのエンティティ・タイプと `static_attributes` は Context Broker のエンティティに
コピーされていますが、測定値 `c|1` にはマッピングがないため、プロパティの名前は 受信した測定値から直接コピーされます。

<a name="provisioning-an-actuator">

### アクチュエータのプロビジョニング

アクチュエータのプロビジョニングは、センサのプロビジョニングに似ています。今回、`endpoint` 属性は IoT Agent が
UltraLight コマンドを送信する必要がある場所を保持し、`commands` 配列は呼び出すことができる各コマンドのリストを含みます。
以下の例では、`deviceId=water001` を使用してウォーターをプロビジョニングしています。エンドポイントは
`http://iot-sensors:3001/iot/water001` であり、`on` コマンドを受け入れることができます。`transport=HTTP`
属性は、使用する通信プロトコルを定義します。

#### :eight: リクエスト:

```console
curl -L -X POST 'http://localhost:4041/iot/devices' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -H 'Content-Type: application/json' \
--data-raw '{
  "devices": [
    {
      "device_id": "water001",
      "entity_name": "urn:ngsi-ld:Device:water001",
      "entity_type": "Device",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "HTTP",
      "endpoint": "http://iot-sensors:3001/iot/water001",
      "commands": [
        {
          "name": "on",
          "type": "Property"
        },
        {
          "name": "off",
          "type": "Property"
        }
       ],
       "static_attributes": [
         {"name":"controlledAsset", "type": "Relationship","value": "urn:ngsi-ld:Building:barn001"}
        ]
    }
  ]
}
'
```

Context Broker を接続する前に、`/ngsi-ld/v1/entities/` エンドポイントを使用して IoT Agent のノース・ポートに直接
PATCH リクエストを送信することにより、コマンドがデバイスに送信できることをテストできます。 接続すると、最終的には
Context Broker によって呼び出されるのはこのエンドポイントです。設定をテストするには、次のようにコマンドを
直接実行します:

#### :nine: リクエスト:

```console
curl -L -X PATCH 'http://localhost:4041/ngsi-ld/v1/entities/urn:ngsi-ld:Device:water001/attrs/on' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -H 'Content-Type: application/json' \
--data-raw '{

        "type": "Property",
        "value": " "

}'
```

デバイス・モニタのページを表示している場合は、 Water sprinkler (散水装置)の状態の変化も確認できます:

![](https://fiware.github.io/tutorials.IoT-Agent/img/water-on.png)

Water sprinkler をオンにするコマンドの結果は、Context Broker 内のエンティティをクエリすることで読み取ることができます。

#### :one::zero: リクエスト:

```console
curl -L -X GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:water001' \
    -H 'NGSILD-Tenant: openiot' \
    -H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
    -H 'Accept: application/json'
```

#### レスポンス:

```json
{
    "id": "urn:ngsi-ld:Device:water001",
    "type": "Device",
    "on_status": {
        "type": "Property",
        "value": {
            "@type": "commandStatus",
            "@value": "OK"
        },
        "observedAt": "2020-09-14T15:27:11.066Z"
    },
    "on_info": {
        "type": "Property",
        "value": {
            "@type": "commandResult",
            "@value": " on OK"
        },
        "observedAt": "2020-09-14T15:27:11.066Z"
    },
    "controlledAsset": {
        "type": "Relationship",
        "object": "urn:ngsi-ld:Building:barn001",
        "observedAt": "2020-09-14T15:27:11.066Z"
    },
    "on": {
        "type": "Property",
        "value": ""
    },
    "off": {
        "type": "Property",
        "value": ""
    }
}
```

`observedAt` は、エンティティに関連付けられたコマンドが最後に呼び出された時刻を示します。`on` コマンドの結果は、
`on_info` 属性の値で確認できます。

<a name="provisioning-a-filling-station">

### Filling Station (充填ステーション) のプロビジョニング

コマンドと測定値の両方を提供するデバイスをプロビジョニングすることは、リクエストのボディに `attributes` と
`command` の両方の属性を含む HTTP POST リクエストを作成するだけです。

#### :one::one: リクエスト:

```console
curl -L -X POST 'http://localhost:4041/iot/devices' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /' \
-H 'Content-Type: application/json' \
-H 'Cookie: _csrf=MAPTGFPcoPnewsGCWklHi4Mq' \
--data-raw '{
  "devices": [
    {
      "device_id": "filling001",
      "entity_name": "urn:ngsi-ld:Device:filling001",
      "entity_type": "FillingLevelSensor",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "HTTP",
      "endpoint": "http://iot-sensors:3001/iot/filling001",
      "commands": [
        {
          "name": "add",
          "type": "Property"
        },
        {
          "name": "remove",
          "type": "Property"
        }
      ],
      "attributes": [
        {
          "object_id": "f",
          "name": "fillingLevel",
          "type": "Number",
          "metadata": {
            "unitCode": {
              "type": "Text",
              "value": "C62"
            }
          }
        }
      ],
       "static_attributes": [
        {
          "name": "controlledAsset",
          "type": "Relationship",
          "value": "urn:ngsi-ld:Building:barn001"
        }
      ]
    }
  ]
}'
```

<a name="provisioning-a-tractor-fmis-system">

### Tractor FMIS System (トラクター FMIS システム) のプロビジョニング

同様に、2つのコマンド (`start` および `stop`) と2つの属性を持つ **Tractor**
は、次のようにプロビジョニングできます:

#### :one::two: リクエスト:

```console
curl -L -X POST 'http://localhost:4041/iot/devices' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -H 'Content-Type: application/json' \
--data-raw '{
  "devices": [
    {
      "device_id": "tractor001",
      "entity_name": "urn:ngsi-ld:Device:tractor001",
      "entity_type": "Tractor",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "HTTP",
      "endpoint": "http://iot-sensors:3001/iot/tractor001",
      "commands": [
        {"name": "start","type": "Property"},
        {"name": "stop","type": "Property"}
       ],
       "static_attributes": [
         {"name":"controlledAsset", "type": "Relationship","value": "urn:ngsi-ld:Building:barn001"}
        ]
    }
  ]
}
'
```

トラクターからの測定値 (`gps` など) はサービス・グループ内ですでに定義されているため、ここで繰り返す必要はありません。

プロビジョニングされたデバイスの完全なリストは、`/iot/devices` エンドポイントに GET
リクエストを行うことで取得できます。

#### :one::three: リクエスト:

```console
curl -L -X GET 'http://localhost:4041/iot/devices' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /'
```

<a name="enabling-context-broker-commands">

## Context Broker コマンドの有効化

IoT Agent を IoT デバイスに接続すると、Orion Context Broker にコマンドが使用可能になったことが通知されます。
つまり、IoT Agent はコマンド属性の [Context Provider](https://github.com/FIWARE/tutorials.Context-Providers/)
として登録されています。

コマンドが登録されると、[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-LD)
で行ったように IoT デバイスに直接 UltraLight 2.0 リクエストを送信するのではなく、Orion Context Broker
にリクエストを送信することにより、**Water sprinkler** をオンにし、**Irrigation System** のオンとオフを
切り替えることができます。

<a name="activating-the-irrigation-system">

### Irrigation System (灌漑システム) のアクティブ化

`on` コマンドを呼び出すには、コンテキストで `on` 属性を更新する必要があります。

#### :one::four: リクエスト:

```console
curl -L -X PATCH 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:water001/attrs/on' \
-H 'NGSILD-Tenant: openiot' \
-H 'Content-Type: application/json' \
-H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
--data-raw '{

        "type": "Property",
        "value": " "

}'
```

デバイス・モニタのページを表示している場合は、ウォーターの変化の状態も確認できます。

![](https://fiware.github.io/tutorials.IoT-Agent/img/water-on.png)

<a name="activating-the-tractor">

### Tractor (トラクター) をアクティブ化

`start` コマンドを呼び出すには、コンテキストで `start` 属性を更新する必要があります。

#### :one::five: リクエスト:

```console
curl -L -X PATCH 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:tractor001/attrs/start' \
    -H 'NGSILD-Tenant: openiot' \
    -H 'Content-Type: application/json' \
    -H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
--data-raw '{

        "type": "Property",
        "value": " "

}'
```

<a name="activating-the-filling-station">

### Filling Station (充填ステーション) の有効化

**Fillling System** の状態を変更するには、コンテキストで `add` 属性を更新する必要があります。

#### :one::six: リクエスト:

```console
curl -L -X PATCH 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:filling001/attrs/add' \
    -H 'NGSILD-Tenant: openiot' \
    -H 'Content-Type: application/json' \
    -H 'Link: <http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"' \
--data-raw '{

        "type": "Property",
        "value": " "

}'
```

<a name="service-group-crud-actions">

# サービス・グループの CRUD アクション

サービス・グループをプロビジョニングするための **CRUD** 操作は、 `/iot/services` エンドポイントで予期される
HTTP 動詞にマップされます:

-   **Create** - HTTP POST
-   **Read** - HTTP GET
-   **Update** - HTTP PUT
-   **Delete** - HTTP DELETE

`resource` および `apikey` パラメータを使用して、サービス・グループを一意に識別します。

<a name="creating-a-service-group">

### サービス・グループの作成

この例では、デバイスの匿名グループをプロビジョニングします。これは、一連のデバイスが IoT Agent が **ノースバウンド**
通信をリッスンしている `IOTA_HTTP_PORT` にメッセージを送信することを IoT Agent に通知します。

#### :one::seven: リクエスト:

```console
curl -iX POST \
  'http://localhost:4041/iot/services' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
 "services": [
   {
     "apikey":      "4jggokgpepnvsb2uv4s40d59ov",
     "cbroker":     "http://orion:1026",
     "entity_type": "Thing",
     "resource":    "/iot/d"
   }
 ]
}'
```

<a name="read-service-group-details">

### サービス・グループの詳細を読み取り

この例では、指定された `resource` パスでプロビジョニングされたサービスの完全な詳細を取得します。

サービス・グループの詳細は、`/iot/services` エンドポイントに GET リクエストを行い、`resource`
パラメータを指定することで読み取ることができます。

#### :one::eight: リクエスト:

```console
curl -X GET \
  'http://localhost:4041/iot/services?resource=/iot/d' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

#### レスポンス:

```json
{
    "count": 1,
    "services": [
        {
            "commands": [],
            "lazy": [],
            "attributes": [
                {
                    "object_id": "bpm",
                    "type": "Property",
                    "name": "heartRate",
                    "metadata": {
                        "unitCode": {
                            "type": "Text",
                            "value": "5K"
                        }
                    }
                },
                {
                    "object_id": "s",
                    "name": "status",
                    "type": "Property"
                },
                {
                    "object_id": "gps",
                    "name": "location",
                    "type": "geo:point"
                }
            ],
            "_id": "5f5f8ad8eed02a000687dec5",
            "resource": "/iot/d",
            "apikey": "4jggokgpepnvsb2uv4s40d59ov",
            "service": "openiot",
            "subservice": "/",
            "__v": 0,
            "static_attributes": [],
            "internal_attributes": [],
            "entity_type": "Device"
        }
    ]
}
```

レスポンスには、`entity_type` やデフォルトのコマンドや属性のマッピングなど、各サービス・グループに関連付けられている
すべてのデフォルトが含まれます。

<a name="list-all-service-groups">

### すべてのサービス・グループを一覧表示

この例では、`/iot/services` エンドポイントに GET リクエストを行うことにより、プロビジョニングされた
すべてのサービスを一覧表示します。

#### :one::nine: リクエスト:

```console
curl -X GET \
  'http://localhost:4041/iot/services' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

#### レスポンス:

```json
{
    "count": 1,
    "services": [
        {
            "commands": [],
            "lazy": [],
            "attributes": [
                {
                    "object_id": "bpm",
                    "type": "Property",
                    "name": "heartRate",
                    "metadata": {
                        "unitCode": {
                            "type": "Text",
                            "value": "5K"
                        }
                    }
                },
                {
                    "object_id": "s",
                    "name": "status",
                    "type": "Property"
                },
                {
                    "object_id": "gps",
                    "name": "location",
                    "type": "geo:point"
                }
            ],
            "_id": "5f5f8ad8eed02a000687dec5",
            "resource": "/iot/d",
            "apikey": "4jggokgpepnvsb2uv4s40d59ov",
            "service": "openiot",
            "subservice": "/",
            "__v": 0,
            "static_attributes": [],
            "internal_attributes": [],
            "entity_type": "Device"
        }
    ]
}
```

レスポンスには、`entity_type` などの各サービス・グループに関連付けられているすべてのデフォルトと、
デフォルトのコマンドまたは属性マッピングが含まれます。

<a name="update-a-service-group">

### サービス・グループを更新

この例では、既存のサービス・グループを特定の `resource` パスと `apikey` で更新します。

サービス・グループの詳細は、`/iot/services` エンドポイントに PUT リクエストを送信し、`resource` および
`apikey` パラメータを提供することで更新できます。

#### :two::zero: リクエスト:

```console
curl -iX PUT \
  'http://localhost:4041/iot/services?resource=/iot/d&apikey=4jggokgpepnvsb2uv4s40d59ov' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "attributes": []
}'
```

<a name="delete-a-service-group">

### サービス・グループを削除

この例では、`/iot/services/` エンドポイントに DELETE リクエストを行うことで、プロビジョニングされた
サービス・グループを削除します。

これは、 IoT Agent が**ノースバウンド**通信をリッスンしている
`http://iot-agent:7896/iot/d?i=<device_id>&k=4jggokgpepnvsb2uv4s40d59ov` へのリクエストが、IoT Agent
によって処理されなくなることを意味します。削除するサービス・グループを特定するには、`apiKey`
パラメータと `resource` パラメータを指定する必要があります。

#### :two::one: リクエスト:

```console
curl -iX DELETE \
  'http://localhost:4041/iot/services/?resource=/iot/d&apikey=4jggokgpepnvsb2uv4s40d59ov' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

<a name="device-crud-actions">

# デバイスの CRUD アクション

個々のデバイスをプロビジョニングするための **CRUD** 操作は、`/iot/devices` エンドポイントで予期される
HTTP 動詞にマッピングされます:

-   **Create** - HTTP POST
-   **Read** - HTTP GET
-   **Update** - HTTP PUT
-   **Delete** - HTTP DELETE

`<device-id>` を使用して、デバイスを一意に識別します。

<a name="creating-a-provisioned-device">

### プロビジョニングされたデバイスの作成

この例では、個々のデバイスをプロビジョニングします。`device_id=water002` をエンティティ URN `urn:ngsi-ld:water:002`
にマップし、エンティティに `water` 型を割り当てます。IoT Agent は、デバイスが2つのコマンド (`on` および `off`)
を提供し、HTTP を使用して `http://iot-sensors:3001/iot/water002` をリッスンしていることを通知されました。
`attributes`, `lazy` 属性, `static_attributes` もプロビジョニングできます。

#### :two::two: リクエスト:

```console
curl -iX POST 'http://localhost:4041/iot/devices' \
    -H 'fiware-service: openiot' \
    -H 'fiware-servicepath: /' \
    -H 'Content-Type: application/json' \
--data-raw '{
  "devices": [
    {
      "device_id": "water002",
      "entity_name": "urn:ngsi-ld:Device:water002",
      "entity_type": "Device",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "HTTP",
      "endpoint": "http://iot-sensors:3001/iot/water002",
      "commands": [
        {
          "name": "on",
          "type": "Property"
        },
        {
          "name": "off",
          "type": "Property"
        }
       ],
       "static_attributes": [
         {"name":"controlledAsset", "type": "Relationship","value": "urn:ngsi-ld:Building:barn002"}
        ]
    }
  ]
}
'
```

<a name="read-provisioned-device-details">

### プロビジョニングされたデバイスの詳細を読み取り

この例では、指定された `<device-id>` パスでプロビジョニングされたデバイスの完全な詳細を取得します。

プロビジョニングされたデバイスの詳細は、`/iot/devices/<device-id>` エンドポイントに GET
リクエストを行うことで読み取ることができます。

#### :two::three: リクエスト:

```console
curl -X GET \
  'http://localhost:4041/iot/devices/water002' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

#### レスポンス:

レスポンスには、デバイスに関連付けられているすべてのコマンドと属性のマッピングが含まれます。

```json
{
    "device_id": "water002",
    "service": "openiot",
    "service_path": "/",
    "entity_name": "urn:ngsi-ld:Device:water002",
    "entity_type": "Device",
    "endpoint": "http://iot-sensors:3001/iot/water002",
    "transport": "HTTP",
    "attributes": [],
    "lazy": [],
    "commands": [
        {
            "object_id": "on",
            "name": "on",
            "type": "Property"
        },
        {
            "object_id": "off",
            "name": "off",
            "type": "Property"
        }
    ],
    "static_attributes": [
        {
            "name": "controlledAsset",
            "type": "Relationship",
            "value": "urn:ngsi-ld:Building:barn002"
        }
    ],
    "protocol": "PDI-IoTA-UltraLight",
    "explicitAttrs": false
}
```

<a name="list-all-provisioned-devices">

### プロビジョニングされたすべてのデバイスを一覧表示

この例では、`/iot/devices` エンドポイントに GET リクエストを送信して、
プロビジョニングされたすべてのデバイスを一覧表示します。

#### :two::four: リクエスト:

```console
curl -X GET \
  'http://localhost:4041/iot/devices' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

#### レスポンス:

レスポンスには、すべてのデバイスに関連付けられているすべてのコマンドと属性のマッピングが含まれます。

```json
{
    "count": 5,
    "devices": [
      {
          "device_id": "water002",
          "service": "openiot",
          "service_path": "/",
          "entity_name": "urn:ngsi",
          "entity_type": "Device",
          "endpoint": "http://iot-sensors:3001/iot/water002",
          "transport": "HTTP",
          "attributes": [],
          "lazy": [],
          "commands": [
              {
                  "object_id": "ring",
                  "name": "ring",
                  "type": "Property"
              }
          ],
          "static_attributes": [
              {
                  "name": "controlledAsset",
                  "type": "Relationship",
                  "value": "urn:ngsi-ld:Store:002"
              }
          ],
          "protocol": "PDI-IoTA-UltraLight"
      },
      etc...
    ]
}
```

<a name="update-a-provisioned-device">

### プロビジョニングされたデバイスを更新

この例では、`/iot/devices/<device-id>` エンドポイントに PUT リクエストを送信することにより、
既存のプロビジョニングされたデバイスを更新します。

#### :two::five: リクエスト:

```console
curl -iX PUT \
  'http://localhost:4041/iot/devices/water002' \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
  "entity_type": "IoT-Device"
}'
```

<a name="delete-a-provisioned-device">

### プロビジョニングされたデバイスを削除

この例では、`/iot/devices/<device-id>` エンドポイントに DELETE リクエストを送信して、
プロビジョニングされたデバイスを削除します。

デバイスの属性はマッピングされなくなり、コマンドをデバイスに送信できなくなります。デバイスがアクティブな測定を
行っている場合、関連するサービスが削除されていなければ、それらはデフォルト値で処理されます。

#### :two::six: リクエスト:

```console
curl -iX DELETE \
  'http://localhost:4041/iot/devices/water002' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /'
```

# 次のステップ

高度な機能を追加することで、アプリケーションに複雑さを加える方法を知りたいですか？ このシリーズの
[他のチュートリアル](https://www.letsfiware.jp/ngsi-ld-tutorials)を読むことで見つけることができます

---

## License

[MIT](LICENSE) © 2020-2023 FIWARE Foundation e.V.
