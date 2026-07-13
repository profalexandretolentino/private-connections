/**
 * ==========================================
 * Private Connections
 * Code.gs
 * ==========================================
 */

/**
 * Recebe requisições GET.
 *
 * Os eventos normais de analytics são ignorados.
 * Apenas connect_clicked cria uma conexão.
 *
 * GET também pode ser usado para testes manuais
 * sem envio de arquivos.
 */
function doGet(e) {
  const params =
    e && e.parameter
      ? e.parameter
      : {};

  const event =
    params.event || "";

  if (event !== "connect_clicked") {
    return jsonResponse({
      status: "ignored",
      event
    });
  }

  try {
    validateConfiguration();

    const result =
      createConnection(params);

    return jsonResponse(result);
  } catch (error) {
    logError("GET", error);

    return jsonResponse({
      status: "error",
      message: String(error)
    });
  }
}

/**
 * Recebe requisições POST.
 *
 * Usado pelo frontend para enviar:
 * - mensagem;
 * - imagem;
 * - vídeo;
 * - áudio;
 * - metadados da conexão.
 */
function doPost(e) {
  try {
    validateConfiguration();

    const rawBody =
      e &&
      e.postData &&
      e.postData.contents
        ? e.postData.contents
        : "{}";

    const data =
      JSON.parse(rawBody);

    const event =
      data.event || "";

    if (event !== "connect_clicked") {
      return jsonResponse({
        status: "ignored",
        event
      });
    }

    const result =
      createConnection(data);

    return jsonResponse(result);
  } catch (error) {
    logError("POST", error);

    return jsonResponse({
      status: "error",
      message: String(error)
    });
  }
}

/**
 * Retorna o status básico do backend.
 *
 * Pode ser executado manualmente no editor.
 */
function testBackendStatus() {
  validateConfiguration();

  const result = {
    status: "online",
    environment: CONFIG.environment,
    sheetName: CONFIG.sheetName,
    timestamp: formatDate(new Date())
  };

  Logger.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}