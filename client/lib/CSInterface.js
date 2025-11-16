/**
 * CSInterface - Simplified version for CEP extensions
 * This is a minimal implementation for communication between CEP and ExtendScript
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
 * Gets the scale factor of the screen
 */
CSInterface.prototype.getScaleFactor = function() {
    var hostEnv = this.getHostEnvironment();
    return hostEnv.appSkinInfo.scaleFactor;
};

/**
 * Gets OS information
 */
CSInterface.prototype.getOSInformation = function() {
    var hostEnv = this.getHostEnvironment();
    return hostEnv.appSkinInfo.systemInfo;
};

/**
 * Opens a URL in the default browser
 */
CSInterface.prototype.openURLInDefaultBrowser = function(url) {
    window.__adobe_cep__.openURLInDefaultBrowser(url);
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

/**
 * Registers an event listener
 */
CSInterface.prototype.addEventListener = function(type, listener, obj) {
    window.__adobe_cep__.addEventListener(type, listener, obj);
};

/**
 * Removes event listener
 */
CSInterface.prototype.removeEventListener = function(type, listener, obj) {
    window.__adobe_cep__.removeEventListener(type, listener, obj);
};

/**
 * Dispatches a CEP event
 */
CSInterface.prototype.dispatchEvent = function(event) {
    if (typeof event.data === "object") {
        event.data = JSON.stringify(event.data);
    }

    window.__adobe_cep__.dispatchEvent(event);
};

/**
 * CEP Event class
 */
var CSEvent = function(type, scope, appId, extensionId) {
    this.type = type;
    this.scope = scope;
    this.appId = appId;
    this.extensionId = extensionId;
};

// Event scope
CSEvent.SCOPE_APPLICATION = "APPLICATION";
CSEvent.SCOPE_GLOBAL = "GLOBAL";
