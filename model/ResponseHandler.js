/**
 * ResponseHandler class Handles all the success/error responses 
 * from server related interactions.
 * 
 * @class
 * @public
 * @file com.amat.spg.labord.model.ResponseHandler
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 Changes					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define(["../util/Constants"], function (Constants) {
	"use strict";

	return {

		/**
		 * This method handles the success response by creating a
		 * model and binding it to Component for a given model name.
		 * @name handleSuccessResponse
		 * @param {Object} oResponeData - Response object
		 * @param {string} sModelName - Response object
		 * @param {Object} oControllerRef - current controller reference
		 */
		handleSuccessResponse: function (oResponeData, sModelName, oControllerRef) {
			switch (sModelName) {
				case Constants.MDL_TOOLID:
				case Constants.MDL_WORKORDERS: //PCR032047++
				case Constants.MDL_TOOLDATA: //PCR032047++
					this._createModelForTheEvent(oResponeData, sModelName, oControllerRef);
					break;
				default:
					break;
			}
		},

		/**
		 * This internal method will create model and binds it to Component
		 * for a given model name.
		 * @name _createModelForTheEvent
		 * @param {Object} oData - Response object
		 * @param {string} modelName - Response object
		 * @param {Object} oControllerRef - current controller reference
		 */
		_createModelForTheEvent: function (oData, modelName, oControllerRef) {
			var oEvtModel = new sap.ui.model.json.JSONModel();

			oEvtModel.setData(oData);
			oEvtModel.setSizeLimit(3000);

			if (modelName === Constants.MDL_SETTINGS) {
				sap.ui.getCore().setModel(oEvtModel, modelName);
			} else {
				oEvtModel = oControllerRef.getComponent().setModel(oEvtModel, modelName);
			}
		},

		/**
		 * This method handles the error response by creating an
		 * appropriate error message.
		 * @name handleErrorResponse
		 * @param {Object} oError - Response object
		 * @param {sap.ui.core.mvc.Controller} oControllerRef - current controller reference
		 * @returns {Object} oResponseObj - Error Message
		 */
		handleErrorResponse: function (oError, oControllerRef) {
			var sErrMsg, sErrMsgVal, oErrRes, oErrBody, sErrMsg1, sErrMsg2;
			var oResObj = {};
			var oErrObj = oError;

			if (oErrObj.response) {
				oErrRes = oErrObj.response;
				oResObj.d = {};
				oResObj.d.ErrorMessage = "";

				if (oErrRes.body) {
					oErrBody = oErrRes.body;

					if (oErrBody.substring(0, 1) === "<" || oErrRes.statusCode === "500") {
						if (typeof (oErrBody) === "string") {
							sErrMsg = $(oErrBody).find("message").text();
							var parser = new DOMParser();
							var xmlDoc = parser.parseFromString(oErrBody, "text/xml");
							sErrMsg1 = xmlDoc.getElementsByTagName("message")[0].textContent;
							sErrMsg2 = xmlDoc.getElementsByTagName("message")[1].textContent;

							sErrMsg = (sErrMsg1 === sErrMsg2) ? sErrMsg1 : (sErrMsg1 + "\n" + sErrMsg2);
						} else if ($(oErrBody).find("message").text()) {
							sErrMsg = oErrObj.message + "\n\n" + oErrRes.statusText;
						} else {
							sErrMsg = oErrObj.message;
						}
					} else if (typeof (oErrBody) === "string") {
						sErrMsg = oErrBody;
					} else {
						oErrBody = JSON.parse(oErrBody);
						sErrMsgVal = oErrBody.error.message.value;
						sErrMsg = oErrObj.message + "\n" + sErrMsgVal;
					}
					oResObj.d.ErrorMessage = sErrMsg;
				} else {
					oResObj.d.ErrorMessage = oErrObj.message;
				}
			} else if (oErrObj.responseText) {
				sErrMsgVal = "";

				if (oErrObj.responseText.indexOf("<message>") > -1) {
					sErrMsgVal = $(oErrObj.responseText).find("message").text();
				} else {
					oErrObj = typeof (oErrObj) === "object" ? oErrObj : JSON.parse(oErrObj.responseText);
					sErrMsgVal = typeof (oErrObj.responseText) === "string" ? oErrObj.responseText : oErrObj.error.message.value; //PCR032047++
					// sErrMsgVal = typeof (oErrObj.responseText) === "string" ? JSON.parse(oErrObj.responseText).error.message.value : oErrObj.error.message.value; //PCR032047--
				}

				oResObj.message = oErrObj.message;
				oResObj.d = {};
				oResObj.d.ErrorMessage = sErrMsgVal;
			} else if (oErrObj.body) {
				oErrBody = oErrObj.body;

				if (oErrBody.substring(0, 1) === "<" || oErrRes.statusCode === "500") {
					if (typeof (oErrBody) === "string") {
						sErrMsg = $(oErrBody).find("message").text();
						sErrMsg = this._oResourseBundle.getText("stndrdErrMsg");
					}
				}

				oResObj.d.ErrorMessage = sErrMsg;
			} else {
				oResObj.d = {};
				oResObj.d.ErrorMessage = oErrObj.name + "\n" + oErrObj.message;
			}

			return oResObj;
		}

	};

});