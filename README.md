# Extrator de Cores

Uma aplicação web moderna e interativa para extrair paletas de cores a partir de imagens. Ideal para designers, desenvolvedores e artistas que precisam capturar a essência visual de uma imagem de forma rápida e precisa. A ferramenta permite não apenas a extração automática, mas também a personalização e exportação da paleta de cores resultante.

## ✨ Funcionalidades

- **Carregamento Flexível de Imagens**:
  - **Arquivo Local**: Carregue uma imagem diretamente do seu computador.
  - **URL**: Insira a URL de uma imagem da web para análise.
  - **Arrastar e Soltar**: Simplesmente arraste e solte um arquivo de imagem na área designada.
  - **Colar da Área de Transferência**: Copie uma imagem (Ctrl+C) e cole-a na aplicação (Ctrl+V).

- **Extração de Paleta**:
  - Gera automaticamente uma paleta de 8 cores predominantes da imagem.
  - Exibe uma paleta de resumo compacta e uma paleta editável detalhada.

- **Personalização da Paleta**:
  - **Ajuste de Tamanho**: Aumente ou diminua o número de cores na paleta (de 2 a 20).
  - **Edição com Conta-gotas**: Clique em qualquer cor da paleta para ativar a ferramenta de conta-gotas e selecionar uma nova cor de qualquer lugar da tela.

- **Visualização de Cores**:
  - Para cada cor, visualize os códigos nos formatos **HEX**, **RGB** e **HSL**.
  - **Copiar com Um Clique**: Copie facilmente qualquer código de cor para a área de transferência.

- **Interação com a Imagem**:
  - **Zoom**: Aproxime ou afaste o zoom na imagem para inspecionar detalhes.
  - **Mover (Pan)**: Clique e arraste para mover a imagem e focar em áreas específicas.
  - **Resetar Visualização**: Retorne a imagem ao seu estado e posição originais.

- **Exportação e Reset**:
  - **Download em PDF**: Exporte a imagem original e sua paleta de cores completa para um arquivo PDF bem formatado.
  - **Resetar Paleta**: Volte para a imagem e paleta de exemplo iniciais com um único clique.

## 🚀 Como Usar

1.  **Carregue uma Imagem**: Use um dos métodos de carregamento (arquivo, URL, arrastar e soltar, ou colar) para iniciar.
2.  **Analise a Paleta**: A aplicação extrairá e exibirá a paleta de cores automaticamente.
3.  **Ajuste o Tamanho**: Utilize os botões `+` e `-` na "Paleta de cores resumo" para adicionar ou remover cores.
4.  **Edite as Cores**:
    - Clique em uma cor na paleta (resumo ou editável) para ativar o conta-gotas.
    - Clique em qualquer ponto da tela (dentro ou fora da imagem) para capturar uma nova cor.
5.  **Copie os Códigos**: Na "Paleta de cores editável", clique no ícone de cópia ao lado de qualquer valor (HEX, RGB, HSL).
6.  **Exporte**: Quando estiver satisfeito, clique em **"Download da paleta"** para gerar um PDF.
7.  **Comece de Novo**: Clique em **"Resetar paleta"** para limpar o estado atual e recomeçar com a imagem padrão.

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - **React**: Biblioteca para a construção da interface de usuário.
  - **TypeScript**: Para tipagem estática e um código mais robusto.
  - **Tailwind CSS**: Framework CSS para estilização rápida e responsiva.

- **Bibliotecas Externas**:
  - **ColorThief.js**: Para a lógica de extração das cores predominantes da imagem.
  - **jsPDF**: Para a geração e exportação de documentos PDF.

- **APIs do Navegador**:
  - **EyeDropper API**: Para a funcionalidade de conta-gotas.
  - **Clipboard API**: Para copiar os códigos de cores.
  - **Drag and Drop API**: Para a funcionalidade de arrastar e soltar.
