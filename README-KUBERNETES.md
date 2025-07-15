# Implantação no Kubernetes (AKS)

Este documento detalha os passos para implantar a aplicação no seu cluster Kubernetes (AKS), utilizando o Azure Container Registry (ACR) para as imagens Docker.

## Pré-requisitos

*   Acesso a um cluster AKS com `kubectl` configurado.
*   Azure CLI (`az`) instalado e autenticado.
*   Docker instalado.
*   Autenticação no seu Azure Container Registry (`suppregistry.azurecr.io`). Se ainda não o fez, execute:
    ```bash
    az acr login --name suppregistry
    ```
    Se o comando acima não funcionar, tente:
    ```bash
    docker login suppregistry.azurecr.io
    # Use as credenciais obtidas de: az acr credential show --name suppregistry --query 'passwords[0].value'
    ```

## Passos Realizados

1.  **Construção das Imagens Docker:**
    As imagens Docker para o `backend` e `frontend` foram construídas localmente e marcadas com o prefixo do seu ACR.
    ```bash
    docker-compose build
    ```

2.  **Envio das Imagens para o ACR:**
    As imagens foram enviadas para o seu Azure Container Registry (`suppregistry.azurecr.io`).
    ```bash
    docker push suppregistry.azurecr.io/backend-gerenciamento-computadores:latest
    docker push suppregistry.azurecr.io/frontend-gerenciamento-computadores:latest
    ```
    *   **Observação:** Se o push falhou com erro de "unauthorized", certifique-se de que você está autenticado corretamente no ACR.

3.  **Criação do Namespace no Kubernetes:**
    O namespace `gen-computadores` foi criado no seu cluster AKS (se já não existisse).
    ```bash
    kubectl create namespace gen-computadores
    ```

4.  **Atualização dos Manifestos do Kubernetes:**
    Os arquivos de implantação (`backend-deployment.yaml` e `frontend-deployment.yaml`) foram atualizados para referenciar as imagens no seu ACR (`suppregistry.azurecr.io`).

5.  **Aplicação dos Manifestos no Cluster AKS:**
    Os deployments e services foram aplicados (ou atualizados) no namespace `gen-computadores` do seu cluster AKS.
    ```bash
    kubectl apply -f kubernetes/ --namespace=gen-computadores
    ```

## Próximos Passos (Verificação)

Para verificar a implantação, você pode usar os seguintes comandos:

*   **Verificar os Pods:**
    ```bash
    kubectl get pods -n gen-computadores
    ```
    Certifique-se de que os pods do `backend` e `frontend` estão em estado `Running`.

*   **Verificar os Deployments:**
    ```bash
    kubectl get deployments -n gen-computadores
    ```

*   **Verificar os Services:**
    ```bash
    kubectl get services -n gen-computadores
    ```
    Anote o `EXTERNAL-IP` do serviço `frontend` (pode levar alguns minutos para ser provisionado).

*   **Acessar a Aplicação:**
    Uma vez que o `EXTERNAL-IP` do serviço `frontend` esteja disponível, você pode acessá-lo em seu navegador.

## População do Banco de Dados (Seed)

Para popular o banco de dados com dados iniciais, você precisará executar o script `seed.py` dentro do pod do backend.

1.  **Obter o nome do Pod do Backend:**
    Primeiro, obtenha o nome exato do seu pod do backend.
    ```bash
    kubectl get pods -n gen-computadores -l app=backend
    ```
    Isso listará os pods com o label `app=backend`. Anote o nome completo do pod (ex: `backend-7dd6f9f984-d9jbb`).

2.  **Executar o script `PSQL` dentro do Pod:**
    Substitua `<nome-do-pod-backend>` pelo nome que você obteve no passo anterior.
    ```bash
    kubectl exec -it <nome-do-pod-backend> -n gen-computadores -- psql "$DATABASE_URL" -f /app/database_schema.sql
    ```
    Este comando executa o interpretador Python dentro do contêiner do pod e aponta para o script `PSQL` localizado em `` (assumindo que o `WORKDIR` no Dockerfile do backend é `/app`).


    ## INGRESS

    kubectl create secret tls supp-pgmbh-tls-secret \
  --cert=kubernetes/certificado-supp/supp-pgmbh-certificado.crt \
  --key=kubernetes/certificado-supp/supp-pgmbh-chave.key \
  --namespace=gen-computadores

  kubectl apply -f kubernetes/ingress/ingress-nginx.yaml 