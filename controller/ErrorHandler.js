/**
 * ErrorHandler class handles application errors by automatically 
 * attaching to the model events and displaying errors when needed. 
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.BaseController
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/base/Object"
], function (UI5Object) {
	"use strict";

	return UI5Object.extend("com.amat.spg.labord.controller.ErrorHandler", {

		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.mvc.Controller} oController reference
		 * @param {String} sCallBackFn - call back function
		 * @public
		 * @alias com.amat.cate.controller.ErrorHandler
		 */
		constructor: function(oController, sCallBackFn) {
			this._oController = oController;
			this._oFragment = this._oController._oFragment;
			this._oComponent = oController.getComponent();
			this._oModel = this._oComponent.getModel();

			this._oModel.attachMetadataFailed(function(oEvent) {
				var oParams = oEvent.getParameters();
				this._oFragment.showServiceError.call(this._oController, oParams.response, sCallBackFn);
			}, this);

			this._oModel.attachRequestCompleted(function(oEvent) {
				var oParams = oEvent.getParameters(),
					oResponse = oParams.response;
				// Event handler for checking if the current request is completed.
				// If the current request is completed and throws an error, open
				// a message box to display the respective error.
				if (oResponse) {
					if (oResponse.message === "Request aborted") {
						return;
					}
				}
				if (oResponse.statusCode === 404 
				    || oResponse.statusCode === 500 
				    || oResponse.statusCode === "404" 
				    || oResponse.statusCode === "500") {
					this._oFragment.showServiceError.call(this._oController, oResponse, sCallBackFn);
				}
			}, this);

			this._oModel.attachRequestFailed(function(oEvent) {
				var oParams = oEvent.getParameters(),
					oResponse = oParams.response;
				// An entity that was not found in the service is also throwing a 404 error in oData.
				// We already cover this case with a notFound target so we skip it here.
				// A request that cannot be sent to the server is a technical error that we have to handle though
				if (oParams.response.statusCode !== "404" 
				    || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {
					if (oResponse) {
						if (oResponse.message === "Request aborted") {
							return;
						}
					}		
					this._oFragment.showServiceError.call(this._oController, oParams.response, sCallBackFn);
				}
			}, this);
		}
		
	});
});