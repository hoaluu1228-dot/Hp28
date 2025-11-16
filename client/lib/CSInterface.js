/**
 * CSInterface - CEP communication library
 */

var CSInterface = function() {};

/**
 * Executes an ExtendScript
 */
CSInterface.prototype.evalScript = function(script, callback) {
    if (callback === null || callback === undefined) {
        callback = function(result) {};
    }
    window.__adobe_cep__.evalScript(script, callback);
};

/**
 * Retrieves information about the host environment
 */
CSInterface.prototype.getHostEnvironment = function() {
    var hostEnv = window.__adobe_cep__.getHostEnvironment();
    return JSON.parse(hostEnv);
};

/**
 * Gets extension ID
 */
CSInterface.prototype.getExtensionID = function() {
    return window.__adobe_cep__.getExtensionId();
};

/**
 * Close extension
 */
CSInterface.prototype.closeExtension = function() {
    window.__adobe_cep__.closeExtension();
};
