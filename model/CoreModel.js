/**
 * CoreModel class handles all the server related interactions.
 * 
 * @class
 * @public
 * @extends sap.ui.model.json.JSONModel
 * @file com.amat.spg.labord.model.CoreModel
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"../util/ServiceConfigConstants",
	"../model/ResponseHandler",
	"../util/Constants"
], function(JSONModel, ODataModel, SrvConfigConst, ResponseHandler, Constants) {
	"use strict";

	var that = this;
	var oCoreModel = JSONModel.extend("com.amat.spg.labord.model.CoreModel", {

		/**
		 * This method is the base constructor for the model class.
		 * @name constructor
		 * @param {sap.ui.core.mvc.Controller} oController - current controller reference
		 */
		constructor: function(oController) {
			JSONModel.prototype.constructor.apply(this, arguments);
			this.initserviceEscMgmtGlobalModel(oController);
		},

		/**
		 * This method is the base constructor for the model class.
		 * @name initSvcCreateModelObjectsGlobalModel
		 * @param {sap.ui.core.mvc.Controller} oController - current controller reference
		 */
		initserviceEscMgmtGlobalModel: function(oController) {
			this.aAttachedEvents = [];
			that = this;
			this._oControllerRef = oController;
			this.oDataModel = oController.getOwnerComponent().getModel();
		},

		/**
		 * This method is the base constructor for the model class.
		 * @name attachserviceEscMgmtEventWithEventName
		 * @param {string} eventName - Holds current event name needs to be attached
		 * @param {object} fnCallback - Function to be called on 
		 * @param {object} oListener - Listener to be notified/ triggered on successful completion of the specified event
		 */
		attachserviceEscMgmtEventWithEventName: function(eventName, fnCallback, oListener) {
			this.aAttachedEvents.push(eventName);
			this.attachEvent(eventName, fnCallback, oListener);
			this.oListener = oListener;
		},

		/**
		 * This method is the base constructor for the model class.
		 * @name fireserviceEscMgmtEventWithEventName
		 * @param {sap.ui.base.Event} oEvent - Holds current event details
		 */
		fireserviceEscMgmtEventWithEventName: function(oEvent) {
			this.oEvent = oEvent;
			switch (this.oEvent.sEventType) {
				case Constants.GET:
					this.handleGetRequest();
					break;
				case Constants.PUT:
				case Constants.POST:
					this.fnGetAuthTokenAndPost();
					break;
				case Constants.DELETE:
					this.handleDeleteRequest();
					break;
				default:
					break;
			}
		},

		/**
		 * This method helps in processing 'GET' request to fetch respective data.
		 * @name handleGetRequest
		 */
		handleGetRequest: function() {
			this.oDataModel.read(this.oEvent.sGetEntitySetPath, {
				filters: this.oEvent.aFilterParams,
				success: this.handleReadResponseSuccess,
				error: this.handleErrorResponse
			});
		},

		/**
		 * This method helps in fetching 'X-CSRF-Token' to establish trust relationship with the backend.
		 * @name fnGetAuthTokenAndPost
		 */
		fnGetAuthTokenAndPost: function() {
			var oRequest = {
				requestUri: SrvConfigConst.getWorkOrdersURL + "/" + SrvConfigConst.getMasterData + "?$filter=IvFieldGroup eq 'ZCIG_REJ_CODE'",
				method: SrvConfigConst.get,
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					"Content-Type": "application/atom+xml",
					"DataServiceVersion": "2.0",
					"X-CSRF-Token": "Fetch"
				}
			};
			that = this;
			OData.request(oRequest, this.handlePostRequest, this.handleErrorResponse);
		},

		/**
		 * This method helps in processing 'POST' request.
		 * @name handlePostRequest
		 * @param {Object} oData - response data for the given request
		 * @param {Object} oResponse - response object for the given request
		 */
		handlePostRequest: function(oData, oResponse) {
			var oHeaders = {
				"x-csrf-token": oResponse.headers['x-csrf-token'],
				"Accept": "application/json"
			};
			var oRequestHandler = {
				requestUri: SrvConfigConst.getWorkOrdersURL + "/" + that.oEvent.sPostEntitySetPath,
				method: SrvConfigConst.post,
				headers: oHeaders,
				data: that.oEvent.oPayload
			};
			OData.request(oRequestHandler, that.handlePostResponseSuccess, that.handleErrorResponse);
		},

		/**
		 * This method helps in processing 'DELETE' request.
		 * @name handleDeleteRequest
		 */
		handleDeleteRequest: function() {
			this.oDataModel.remove(this.oEvent.sDeleteEntitySetPath, {
				method: Constants.DELETE,
				success: this.handleDeleteResponseSuccess,
				error: this.handleErrorResponse
			});
		},

		/**
		 * This method purpose is to handle success response for batch read request
		 * @name handleReadResponseSuccess
		 * @param {Object} oData - batch response data object
		 * @param {Object} oResponse - service call success response
		 */
		handleReadResponseSuccess: function(oData, oResponse) {
			var iStatusCode = oResponse.statusCode;
			var oResponseObj = {
				d: {}
			};
			if (iStatusCode === 200 || iStatusCode === "200") {
				oResponseObj.d.results = oData.results;
				ResponseHandler.handleSuccessResponse(oResponseObj, that.oEvent.sModelName, that._oControllerRef);
				that.fireEvent(that.aAttachedEvents[0]);
			} else if (iStatusCode >= 400 && iStatusCode <= 500) {
				that.handleErrorResponse(oResponse);
			}
		},

		/**
		 * This method purpose is to handle success response for post request.
		 * @name handlePostResponseSuccess
		 * @param {Object} oData - batch response data object
		 * @param {Object} oResponse - service call success response
		 */
		handlePostResponseSuccess: function(oData, oResponse) {
			var iStatusCode = oResponse.statusCode;
			if (iStatusCode === 201) {
				if (that.oEvent.sEventType === Constants.PUT) {
					that.handleGetRequest(that._oControllerRef);
				} else {
					that.fireEvent(that.aAttachedEvents[0], oResponse);
				}
			} else if (iStatusCode >= 400 && iStatusCode <= 500 || iStatusCode >= "400" && iStatusCode <= "500") {
				that.handleErrorResponse(oResponse);
			}
		},

		/**
		 * This method purpose is to handle success response for delete request.
		 * @name handleDeleteResponseSuccess
		 * @param {Object} oData - batch response data object
		 * @param {Object} oResponse - service call success response
		 */
		handleDeleteResponseSuccess: function(oData, oResponse) {
			var iStatusCode = oResponse.statusCode;

			if (iStatusCode === 204 || iStatusCode === "204") {
				that.fireEvent(that.aAttachedEvents[0], oResponse);
			} else if (iStatusCode >= 400 && iStatusCode <= 500 || iStatusCode >= "400" && iStatusCode <= "500") {
				that.handleErrorResponse(oResponse);
			}
		},

		/**
		 * This method purpose is to handle error response for batch read request
		 * @name handleErrorResponse
		 * @param {Object} oError response data object
		 */
		handleErrorResponse: function(oError) {
			var oErrorResponse = ResponseHandler.handleErrorResponse(oError, that._oControllerRef);
			that.fireEvent(that.aAttachedEvents[1], oErrorResponse);
		}

	});

	return oCoreModel;

});