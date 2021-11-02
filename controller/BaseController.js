/**
 * BaseController is the parent for the controllers in the Labor Order Application.
 * All the reusable methods are added in this controller.
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
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112 	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ValueState",
	"sap/m/MessageToast",
	"../model/CoreModel",
	"../model/ModelObjects",
	"../model/ResponseHandler",
	"../util/Constants",
	"../util/EventTriggers",
	"../util/Formatter",
	"../util/IdHelper",
	"../util/ServiceConfigConstants"
], function (Controller, UIComponent, History, JSONModel, ValueState, MessageToast, CoreModel, ModelObj, ResponseHandler, Constants,
	EventTriggers, Formatter, IDH, ServiceConfigConstants) {
	"use strict";

	return Controller.extend("com.amat.spg.labord.controller.BaseController", {

		/**
		 * this method returns the Component of the application 
		 * @name getComponent
		 * @returns {Object} Component object
		 */
		getComponent: function () {
			return this.getOwnerComponent();
		},

		/**
		 * Convenience method for accessing the router.
		 * @name getRouter
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @name getModel
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @name setModel
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * this method returns the model with name from component
		 * @name getModelFromComponent
		 * @param {String} sModelName - model name
		 * @returns {Object} Model object
		 */
		getModelFromComponent: function (sModelName) {
			return this.getOwnerComponent().getModel(sModelName);
		},

		/**
		 * Getter for the resource bundle.
		 * @name getResourceBundle
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * This method is for registration of oData Model .
		 * @name finishoDataModelregistartionProcessWithParams
		 * @param {sap.ui.base.Event} oEvent - service call params obj
		 */
		finishoDataModelregistartionProcessWithParams: function (oEvent) {
			this.oPrjMgmt = new CoreModel(this);
			this.oPrjMgmt.attachserviceEscMgmtEventWithEventName(
				oEvent.sEventSuccss,
				jQuery.proxy(this[oEvent.sSuccessHandler]),
				this);
			this.oPrjMgmt.attachserviceEscMgmtEventWithEventName(
				oEvent.sEventError,
				jQuery.proxy(this[oEvent.sErrorHandler]),
				this);
			this.oPrjMgmt.fireserviceEscMgmtEventWithEventName(oEvent);
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @name onNavBack
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				var oCrossAppNavigator = sap.ushell.Container.getService(Constants.CAN_SRV);

				if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					this.getRouter().navTo(Constants.ROUTE_WORKORDERS, {}, true);
				}
			} else {
				history.go(-1);
			}
		},

		/**
		 * Method to fetch ID of a logged in user.
		 * @name getUserId
		 * @returns {String} sUserId - Current User id
		 */
		getUserId: function () {
			var oCont = sap.ushell,
				sUserId = "";

			if (oCont) {
				if (oCont.Container) {
					sUserId = oCont.Container.getUser().getId();
				}
			}

			return sUserId;
		},

		/**
		 * Method to fetch User name of a logged in user.
		 * @name getUserName
		 * @returns {String} sUserName - Current User Name
		 */
		getUserName: function () {
			var oCont = sap.ushell,
				sUserName = "";

			if (oCont) {
				if (oCont.Container) {
					sUserName = oCont.Container.getUser().getFullName();
				}
			}

			return sUserName;
		},

		/**
		 * Event handler for to Fiori Launchpad.
		 * @name onNavToFLPHome
		 * @param {Object} oTarget - Fiori Launpad Target
		 * @public
		 */
		onNavToFLPHome: function (oTarget) {
			var oCrossAppNavigator;

			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				oCrossAppNavigator = sap.ushell.Container.getService(Constants.CAN_SRV);
				oCrossAppNavigator.toExternal(oTarget);
			}
		},

		/**
		 * Creates a model for the current view with the given properties.
		 * @name createViewModel
		 * @param {Object} oViewData - current view properties
		 * @public
		 */
		createViewModel: function (oViewData) {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel(oViewData);
			this.setModel(oViewModel, oViewData.sModelName);
		},

		/**
		 * Sets the item count on the master list header.
		 * @name updateListItemCount
		 * @param {Object} oProperties properties of the list
		 * @private
		 */
		updateListItemCount: function (oProperties) {
			var sTitle, sText;
			var oModel = this.getModel(oProperties.ModelName),
				oList = this.getView().byId(oProperties.ListId),
				oBinding = oList.getBinding(Constants.PROP_ITEMS);

			if (oBinding) {
				// only update the counter if the length is final
				if (oList.getBinding(Constants.PROP_ITEMS).isLengthFinal()) {
					sText = oProperties.TotalItems > 0 ? oProperties.CountRef : oProperties.StringRef;
					sTitle = this.getResourceBundle().getText(sText, [oProperties.TotalItems]);
					oModel.setProperty("/title", sTitle);
				}
			}
		},

		/**
		 * This method will reset the controller to its initial position.
		 * @name scrollToInitialPosition
		 * @param {String} sControllerRef - controller reference
		 * @returns {Object} View object
		 */
		scrollToInitialPosition: function (sControllerRef) {
			return this.getView().byId(sControllerRef).scrollTo(0);
		},

		/**
		 * Display the given message in the message toast.
		 * @name messageToast
		 * @param {String} sMsg - message to be shown
		 * @public
		 */
		messageToast: function (sMsg) {
			MessageToast.show(sMsg, {
				width: "20em",
				my: "center top", //PCR032047++ changed right to center
				at: "center top" //PCR032047++ changed right to center
			});
		},

		/**
		 * MetadataLoaded event handler which will update the given
		 * properties in the current view model.
		 * @name onMetadataLoaded
		 * @param {String} sModelName - current view model name
		 * @public
		 */
		onMetadataLoaded: function (sModelName) {
			var oViewModel = this.getModel(sModelName);

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
		},

		/**
		 * This method toggles that busy state of an element.
		 * @name validateDataReceived
		 * @param {String} sElementId - Element Id
		 * @param {String} sItems - Element's aggregation reference
		 * @public
		 */
		validateDataReceived: function (sElementId, sItems) {
			var oElement = this.getView().byId(sElementId),
				oBinding = oElement.getBinding(sItems);

			if (oBinding) {
				oElement.setBusyIndicatorDelay(0);
				oElement.setBusy(true);
				oElement.getBinding(sItems).attachEventOnce(Constants.EM_DATA_RCVD,
					function (oData, oResponse) {
						oElement.setBusy(false);
					}
				);
			}
		},

		/**
		 * This method helps in setting the blank template 
		 * when no items are available
		 * @name setEmptyScreenTemplate
		 * @param {String} sNoDataText - no data text
		 * @returns {Object} oVBox - empty screen icon box 
		 */
		setEmptyScreenTemplate: function (sNoDataText) {
			var oIcon = new sap.m.Image({
				src: jQuery.sap.getModulePath("com/amat/spg/labord/mime", "/EmptyScreenSymbol.png")
			});

			var oText = new sap.m.Text({
				text: sNoDataText
			}).addStyleClass("sapUiSmallMarginTop").addStyleClass("spgLabOrdAttNoDataText");
			var oLayoutData = new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			});
			var oVBox = new sap.m.VBox("idEmptyScreenBox", {
				alignItems: "Center",
				justifyContent: "Center",
				items: [oIcon, oText],
				layoutData: oLayoutData
			}).addStyleClass("spgLabOrdB3").addStyleClass("spgLabOrdAttGridHeight");

			return oVBox;
		},

		/**
		 * This method is the success call back function for a given event.
		 * @name handleEventSuccess
		 * @param {Object} oSuccess - success response object
		 * @param {Object} oProperties - success response properties
		 */
		handleEventSuccess: function (oSuccess, oProperties) {
			var oList = this.getView().byId(oProperties.sListId),
				oListBindings = oList.getBinding(oProperties.sBinding);
			var that = this;
			var bError = false;
			var bSuccess = false;

			if (oSuccess.hasOwnProperty("mParameters")) {
				bSuccess = oSuccess.getParameter(Constants.PROP_STATCODE) === 201 || oSuccess.getParameter(Constants.PROP_STATCODE) === "204";
			} else if (oSuccess.statusCode === "201" || oSuccess.statusCode === "204") {
				bSuccess = true;
			}

			if (bSuccess) {
				bError = this.handleErrorResponseInSuccessEvent(oSuccess);

				if (bError) {
					this.onDialogClose();
					return;
				}

				oListBindings.refresh();
				oListBindings.attachEventOnce(Constants.EM_DATA_RCVD, function (oData) {
					if (oData.getParameter(Constants.PROP_DATA) || oData) {
						that.onDialogClose();
						if (oProperties.fnFunction) {
							that[oProperties.fnFunction].call(that, oData);
							return;
						}

						that._oFragment.handleCallBackResponse.call(that,
							oProperties.hdr,
							that._oResourceBundle.getText(oProperties.sMsg)
						);
					}
				});
			}
		},

		/**
		 * This method will handle the Error Response in Success Callback function.
		 * @name handleErrorResponseInSuccessEvent
		 * @param {Object} oSuccess - success response object
		 * @returns {Boolean} flag that represents an error in success response
		 */
		handleErrorResponseInSuccessEvent: function (oSuccess) {
			var bError = false;

			if (oSuccess.hasOwnProperty("mParameters")) {
				if (oSuccess.getParameter(Constants.PROP_DATA)) {
					if (oSuccess.getParameter(Constants.PROP_DATA).ErrorMessage) {
						this.onShowErrorResponse.call(this, oSuccess, {
							hdr: this._oResourceBundle.getText("errorResponseHeader"),
							sMsg: oSuccess.getParameter(Constants.PROP_DATA).ErrorMessage
						});

						bError = true;
					}
				}
			}

			return bError;
		},

		/**
		 * This method is the error call back function for a given  event.
		 * @name handleEventFail
		 * @param {Object} oError - error response object
		 * @param {Object} oProperties - error response properties
		 */
		handleEventFail: function (oError) {
			this.onDialogClose();
			this._oFragment.showServiceError.call(this, oError, "handleErrorMessageBoxClose");
		},

		/**
		 * Event handler for close button in Error Dialog box.
		 * @name handleErrorMessageBoxClose
		 */
		handleErrorMessageBoxClose: function () {
			return;
		},

		/**
		 * This method is the error call back function for a given  event.
		 * @name onShowErrorResponse
		 * @param {Object} oError - error response object
		 * @param {Object} oProperties - error response properties
		 */
		onShowErrorResponse: function (oError, oProperties) {
			this.onDialogClose();
			this._oFragment.handleCallBackResponse.call(this, oProperties.hdr, oProperties.sMsg);
		},

		/**
		 * This method will help in navigating to Emp List
		 * search view in the advance search fragment.
		 * @name onPressEmpIdValueHelp
		 */
		onPressEmpIdValueHelp: function () {
			var oView = this.getView();
			var oAdvSearchNavCon = oView.byId(IDH.id.ADV_SEARCH_NAV_CONT),
				oAssignedToPage = oView.byId(IDH.id.ADV_SEARCH_ASSIGNEDTO);

			oAdvSearchNavCon.to(oAssignedToPage);
		},

		/**
		 * This method will help to navigate back from current view
		 * to previous view in advance search fragment.
		 * @name onUserDetailsNavBack
		 */
		onUserDetailsNavBack: function () {
			this.getView().byId(IDH.id.ADV_SEARCH_NAV_CONT).back();
		},

		/**
		 * Event handler for datepicker's change method.
		 * @name onStartDateChange
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onStartDateChange: function (oEvent) {
			var oDtPkr = oEvent.getSource(),
				oDate = oDtPkr.getDateValue();

			oDtPkr.setValueState((typeof oDate === Constants.PROP_OBJECT) ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error);
		},

		/**
		 * Event handler for Input live change to set value state 
		 * @name onElementLiveChange
		 * @param {sap.ui.base.Event} oEvent - Live change event
		 */
		onElementLiveChange: function (oEvent) {
			var oInput = oEvent.getSource(),
				sInpValue = oInput.getValue();

			oInput.setValueState(sInpValue.length > 0 ? sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error);
		},

		/**
		 * Event handler to destroy all the dialogs instances
		 * attached to a given view.
		 * @name onExit
		 */
		onExit: function () {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName) || this._formFragments[sPropertyName] == null) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		},

		/* =========================================================== */
		/* Pre-Task Check List		                                   */
		/* =========================================================== */

		/**
		 * Internal method to fetch tool details.
		 * @name _fnGetToolData
		 * @param {String} sToolId - Tool
		 * @param {String} sEvt - Event Ref
		 */
		_fnGetToolData: function (sToolId, sEvt) { //PCR03367++; added sEvt
			var that = this;
			var sToolIdUrl = ServiceConfigConstants.sToolIdUrl + sToolId;

			var oToolDataReq = new Promise(function (fnResolve, fnReject) {
				jQuery.ajax({
					type: Constants.GET,
					url: sToolIdUrl,
					dataType: "json",
					async: true,
					success: function (oData, oResponse) {
						//Start of PCR033677++ changes
						var oLabOrdModel = that.getModel(Constants.MDL_LABORD);
						oLabOrdModel.setProperty("/BuildingNo", oData.building);
						
						if (sEvt === "details") {
							that._fnUpdateBuildingNo(oData);
						}
						//End of PCR033677++ changes
						
						if (!oData || !oData.toolID) {
							fnReject({
								error: true
							});
						} else {
							fnResolve({
								data: oData
							});
						}
					},
					error: function (error) {}
				});
			});

			oToolDataReq.then(
				function (mParams) {
					if (!mParams || mParams.error) {
						return;
					}

					that._fnFetchPreTaskListData({
						url: "sMOCUrl",
						items: "MOC",
						busy: "MOCBusy",
						field: "Moc",
						flag: "MocMandtFlag",
						payload: mParams.data,
						noData: [{
							MOCNumber: that._oResourceBundle.getText("noDataAvailable"),
							ItemID: that._oResourceBundle.getText("noDataAvailable")
						}]
					});
				}.bind(that)
			);

			oToolDataReq.then(
				function (mParams) {
					if (!mParams || mParams.error) {
						return;
					}

					that._fnFetchPreTaskListData({
						url: "sGSRUrl",
						items: "GSR",
						busy: "GSRBusy",
						field: "Gsr",
						flag: "GsrMandtFlag",
						payload: mParams.data,
						noData: [{
							JobNumber: that._oResourceBundle.getText("noDataAvailable")
						}]
					});
				}.bind(that)
			);

			oToolDataReq.then(
				function (mParams) {
					if (!mParams || mParams.error) {
						return;
					}

					that._fnFetchPreTaskListData({
						url: "sAbatReqUrl",
						items: "Abatement",
						busy: "AbatementBusy",
						field: "Abatement",
						flag: "AbatementMandtFlag",
						payload: mParams.data,
						noData: [{
							RevisionNumber: that._oResourceBundle.getText("noDataAvailable")
						}]
					});
				}.bind(that)
			);

			oToolDataReq.then(
				function (mParams) {
					if (!mParams || mParams.error) {
						return;
					}

					that._fnFetchPreTaskListData({
						url: "sChemAuthUrl",
						items: "ChemAuth",
						busy: "ChemAuthBusy",
						field: "ChemAuth",
						flag: "CauthMandtFlag",
						payload: mParams.data,
						noData: [{
							ProductName: that._oResourceBundle.getText("noDataAvailable")
						}]
					});
				}.bind(that)
			);

			oToolDataReq.then(
				function (mParams) {
					if (!mParams || mParams.error) {
						return;
					}

					that._fnFetchPreTaskListData({
						url: "sPASRUrl",
						items: "PASR",
						busy: "PASRBusy",
						field: "Pasr",
						// flag: "Pasr", //PCR032047--
						flag: "PasrMandtFlag", //PCR032047++
						payload: mParams.data,
						noData: [{
							EquipmentID: that._oResourceBundle.getText("noDataAvailable")
						}]
					});
				}.bind(that)
			);

			oToolDataReq.then(
				function (mParams) {
					if (!mParams || mParams.error) {
						return;
					}

					that._fnFetchPreTaskListData({
						url: "sFSRUrl",
						items: "FSR",
						busy: "FSRBusy",
						field: "Fsr",
						flag: "FsrMandtFlag",
						payload: mParams.data,
						noData: [{
							FSRID: that._oResourceBundle.getText("noDataAvailable")
						}]
					});
				}.bind(that)
			);
		},

		/**
		 * Internal method to fetch tool details.
		 * @name _fnFetchPreTaskListData
		 * @param {Object} oProp - Properties
		 */
		_fnFetchPreTaskListData: function (oProp) {
			var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD),
				bCreateEvent = oLabOrdModel.getProperty("/CreateEvent");
			var that = this;

			oLabOrdModel.setProperty("/" + oProp.busy, true);

			jQuery.ajax({
				type: "POST",
				url: ServiceConfigConstants[oProp.url],
				data: oProp.payload,
				dataType: "json",
				async: true,
				success: function (oData, oResponse) {
					oLabOrdModel.setProperty("/" + oProp.items, oData.length ? oData : oProp.noData);
					oLabOrdModel.setProperty("/" + oProp.busy, false);

					if (!bCreateEvent) {
						oLabOrdModel.getProperty("/PreTaskCheckList")[oProp.items] = that._fnGetPreTaskListItems(oProp.items, oProp.field, oProp.flag);
						oLabOrdModel.updateBindings();
						sap.ui.controller(Constants.CONT_SUMMARY)._fnValidateChecklistItems(); //PCR032047++
					}
				},
				error: function (error) {
					oLabOrdModel.setProperty("/" + oProp.busy, false);
				}
			});
		},
		
		/** 
		 * Internal method to set pre task list data to its corresponding table
		 * @name _fnGetPreTaskListItems
		 * @param {String} sTitle - Pre requiste title
		 * @param {String} sProp - Number property
		 * @param {String} sFlag - Mandatory switch flag
		 * @returns {Object} Task Item
		 */
		_fnGetPreTaskListItems: function (sTitle, sProp, sFlag) {
			var oLabOrdModel = this.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx"),
				aItems = oLabOrdModel.getProperty("/" + sTitle);
			var oPreTask = {
				Abatement: "RevisionNumber",
				Fsr: "FSRID",
				Pasr: "EquipmentID",
				Gsr: "JobNumber",
				ChemAuth: "ProductName",
				Moc: "MOCNumber"
			};
			var oTaskItem = {
				PreRequiste: sTitle,
				Mandatory: oCntx[sFlag].toUpperCase() === Constants.PROP_YES ? "Yes" : "No",
				Number: oCntx[sProp] ? oCntx[sProp] : "", //PCR032047--; removed "-"
				RevisionNumber: "", //PCR032047--; removed "-"
				Status: "", //PCR032047--; removed "-"
				LinkUrl: "" //PCR032047++
			};

			for (var oItem in aItems) {
				if (oCntx[sProp] === aItems[oItem][oPreTask[sProp]]) {
					oTaskItem.Status = aItems[oItem].Status;
					oTaskItem.LinkUrl = aItems[oItem].LinkUrl || aItems[oItem].LinkURL; //PCR032047++

					if (sProp === "Abatement") {
						oTaskItem.RevisionNumber = aItems[oItem].RevisionNumber;
					}
					break;
				}
			}

			return oTaskItem;
		},

		/* =========================================================== */
		/* Create/Update Work Order                                    */
		/* =========================================================== */

		/** 
		 * Internal method to get pre task list data from its corresponding elements
		 * @name _fnGetPreTaskCheckListData
		 * @returns {Object} Pre task check list data
		 */
		_fnGetPreTaskCheckListData: function () {
			var oLabOrdModel = this.getComponent().getModel(Constants.MDL_LABORD),
				bCreateEvent = oLabOrdModel.getProperty("/CreateEvent");
			var oView = this.getView(),
				oTable = oView.byId(IDH.id.PRETASK_CHECKLIST_TABLE),
				aItem = oTable.getItems();
			var oProp = {},
				oFlag = {},
				oPreTakCheckList = {};
			var sNoDataTxt = this._oResourceBundle.getText("noDataAvailable"); //PCR032047++
			var sProp, sSelKey;

			if (bCreateEvent) {
				oProp = {
					Gsr: "GsrMandtFlag",
					Abatement: "AbatementMandtFlag",
					Pasr: "PasrMandtFlag",
					Fsr: "FsrMandtFlag",
					Moc: "MocMandtFlag",
					ChemAuth: "CauthMandtFlag"
				};

				for (sProp in oProp) {
					sSelKey = oView.byId(sProp).getSelectedKey();
					oPreTakCheckList[sProp] = sSelKey === this._oResourceBundle.getText("noDataAvailable") ? "" : sSelKey;
					oPreTakCheckList[oProp[sProp]] = oView.byId(oProp[sProp]).getState() ? Constants.PROP_YES : Constants.PROP_NO;
				}

				oPreTakCheckList = jQuery.extend(oFlag, oPreTakCheckList);
			} else {
				var sMocKey = aItem[0].getCells()[2].getItems()[1].getSelectedKey(),
					sGsrKey = aItem[1].getCells()[2].getItems()[1].getSelectedKey(),
					aAbatementKey = aItem[2].getCells()[2].getItems()[1].getSelectedKey(),
					sChemAuthKey = aItem[3].getCells()[2].getItems()[1].getSelectedKey(),
					sPasrKey = aItem[4].getCells()[2].getItems()[1].getSelectedKey(),
					sFsrKey = aItem[5].getCells()[2].getItems()[1].getSelectedKey();

				oPreTakCheckList = {
					// "Moc": sMocKey === this._oResourceBundle.getText("noDataAvailable") ? "" : sMocKey, //PCR032047--
					"MocMandtFlag": aItem[0].getCells()[1].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO,
					// "Gsr": sGsrKey === this._oResourceBundle.getText("noDataAvailable") ? "" : sGsrKey, //PCR032047--
					"GsrMandtFlag": aItem[1].getCells()[1].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO,
					// "Abatement": aAbatementKey === this._oResourceBundle.getText("noDataAvailable") ? "" : aAbatementKey, //PCR032047--
					"AbatementMandtFlag": aItem[2].getCells()[1].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO,
					// "ChemAuth": sChemAuthKey === this._oResourceBundle.getText("noDataAvailable") ? "" : sChemAuthKey, //PCR032047--
					"CauthMandtFlag": aItem[3].getCells()[1].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO,
					// "Pasr": sPasrKey === this._oResourceBundle.getText("noDataAvailable") ? "" : sPasrKey, //PCR032047--
					"PasrMandtFlag": aItem[4].getCells()[1].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO,
					// "Fsr": sFsrKey === this._oResourceBundle.getText("noDataAvailable") ? "" : sFsrKey, //PCR032047--
					"FsrMandtFlag": aItem[5].getCells()[1].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO,
					
					//Start of PCR032047++ changes
					
					"Moc": (sMocKey === sNoDataTxt || !sMocKey) ? Constants.PROP_BLANK : sMocKey,
					"Gsr": (sGsrKey === sNoDataTxt || !sGsrKey) ? Constants.PROP_BLANK : sGsrKey,
					"Abatement": (aAbatementKey === sNoDataTxt || !aAbatementKey) ? Constants.PROP_BLANK : aAbatementKey,
					"ChemAuth": (sChemAuthKey === sNoDataTxt || !sChemAuthKey) ? Constants.PROP_BLANK : sChemAuthKey,
					"Pasr": (sPasrKey === sNoDataTxt || !sPasrKey) ? Constants.PROP_BLANK : sPasrKey,
					"Fsr": (sFsrKey === sNoDataTxt || !sFsrKey) ? Constants.PROP_BLANK : sFsrKey
					
					//End of PCR032047++ changes
				};
			}

			return oPreTakCheckList;
		},

		/**
		 * Event handler to create/update given Service Case
		 * @name handleWorkOrderCreation
		 */
		handleWorkOrderCreation: function () {
			var oView = this.getView();
			var oWOCrtPayload = new ModelObj(Constants.MOBJ_WOORDCRT),
				oWorkOrderEvt = new ModelObj(Constants.MOBJ_OEVENT);
			var oLabOrdModel = this.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/oToolId"),
				bCreateEvent = oLabOrdModel.getProperty("/CreateEvent");
			// Start of PCR035112++ changes
			/*var sStartDate = Formatter.formatDateWithPattern(
				oView.byId(IDH.id.REQ_START_DATE_DTPKR).getDateValue(), Constants.POST_DATETIME_FORMAT
			);*/
			var sStartDate = oView.byId(IDH.id.REQ_START_DATE_DTPKR).getValue(),
				sHours = oView.byId(IDH.id.HOURS_CMBX).getSelectedKey(),
				sMin = oView.byId(IDH.id.MIN_CMBX).getSelectedKey(),
				sStartTime = sHours + sMin + "00";
			
			sStartTime = sStartTime ? sStartTime : "000000";
			sStartDate += sStartTime;
			
			if (!bCreateEvent && oCntx.Status === Constants.WO_REJ_STAT) {
				oWOCrtPayload.WoResubmitFlag = "X";
			}
			
			// End of PCR035112++ changes
			var oPreTaskCheckList = this._fnGetPreTaskCheckListData();
			
			//Start of PCR033677++ changes
			var oLabOrdModel = this.getModel(Constants.MDL_LABORD),
				sBuildingNo = oLabOrdModel.getProperty("/BuildingNo");
			//End of PCR033677++ changes

			this._oFragment.openBusyDialogExt.call(this, this._oResourceBundle.getText("busyDialogMsg"));

			oWOCrtPayload.Customertoolid = oCntx.Customertoolid;
			oWOCrtPayload.Equipment = oCntx.Equipment;
			oWOCrtPayload.Soldtoparty = oCntx.Soldtoparty;
			oWOCrtPayload.Fabname = oCntx.Fabname;
			oWOCrtPayload.Servicecasenumber = !bCreateEvent ? oCntx.Servicecasenumber : "";
			oWOCrtPayload.Startdatetime = sStartDate;
			oWOCrtPayload.TimeZone = oCntx.TimeZone;
			oWOCrtPayload.ToolManagerName = oCntx.ToolManagerName;

			oWOCrtPayload.Assembly = oView.byId(IDH.id.CHMB_TYP_CMBX).getSelectedKey();
			oWOCrtPayload.Category2 = oView.byId(IDH.id.CATEGORY_CMBX).getSelectedKey();
			oWOCrtPayload.Delay = oView.byId(IDH.id.REASON_CMBX).getSelectedKey();
			oWOCrtPayload.Priority = oView.byId(IDH.id.PRIORITY_CMBX).getSelectedKey();
			oWOCrtPayload.Problemdescription = oView.byId(IDH.id.WORK_DESC_TXTARA).getValue();
			oWOCrtPayload.Projname = oView.byId(IDH.id.TITLE_INP).getValue();
			oWOCrtPayload.Serialnumber = oView.byId(IDH.id.SERIALNO_INP).getValue();
			oWOCrtPayload.Toolstatus = oView.byId(IDH.id.TOOL_STAT_CMBX).getSelectedKey();
			oWOCrtPayload.WorkStatus = oView.byId(IDH.id.STATUS_CMBX).getSelectedKey();
			oWOCrtPayload.BuildingNo =  sBuildingNo; //PCR033677++

			oWOCrtPayload = jQuery.extend(oWOCrtPayload, oPreTaskCheckList);

			oWorkOrderEvt.sEventType = Constants.POST;
			oWorkOrderEvt.sEvent = EventTriggers.TRIGGER_CREATE_WORKORDER;
			oWorkOrderEvt.sEventSuccss = EventTriggers.CREATE_WORKORDER_SUCCESS;
			oWorkOrderEvt.sEventError = EventTriggers.CREATE_WORKORDER_FAIL;
			oWorkOrderEvt.sPostEntitySetPath = ServiceConfigConstants.workOrderSet;
			oWorkOrderEvt.oPayload = oWOCrtPayload;
			oWorkOrderEvt.sSuccessHandler = "handleWorkOrderCreationSuccess";
			oWorkOrderEvt.sErrorHandler = "handleWorkOrderCreationFail";

			this.finishoDataModelregistartionProcessWithParams.call(this, oWorkOrderEvt);
		},

		/**
		 * Success call back function of service order create event
		 * @name handleWorkOrderCreationSuccess
		 * @param {Object} oSuccess - success response
		 * @param {Object} oResponse - request response
		 */
		handleWorkOrderCreationSuccess: function (oSuccess, oResponse) {
			var oLabOrdModel = this.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/oToolId"),
				bCreateEvent = oLabOrdModel.getProperty("/CreateEvent");
			var sWorkOrder, sSucMsg, sErrMsg;

			if (bCreateEvent) {
				sWorkOrder = oSuccess.getParameter(Constants.PROP_DATA).Servicecasenumber;
				sSucMsg = sErrMsg ? " with errors:  \n\n" + sErrMsg : this._oResourceBundle.getText("Successfully");
			} else {
				sWorkOrder = oCntx.Servicecasenumber ? oCntx.Servicecasenumber : "";
				sSucMsg = "";

			}

			sErrMsg = oSuccess.getParameter(Constants.PROP_DATA).ErrorMessage;

			if ((!sWorkOrder && bCreateEvent) || (!bCreateEvent && sErrMsg)) {
				this.onDialogClose();
				this.onShowErrorResponse(oResponse, {
					hdr: this._oResourceBundle.getText("errorResponseHeader"),
					sMsg: sErrMsg
				});
				return;
			}

			var aAttachments = this._workOrderAttachments.files;

			if (aAttachments.length) {
				jQuery.sap.delayedCall(2000, this, function () {
					this.onUploadAttachment(
						(oCntx.Servicecasenumber || sWorkOrder),
						this.getResourceBundle().getText("workOrderCreateCreate") + sSucMsg + " '" + sWorkOrder + "'"
					);
				});
			} else {
				this._fnHandleCreateSuccessResponse(sWorkOrder, sSucMsg);
			}
		},

		/**
		 * This method is a success call back function for case creation service call.
		 * @name _fnHandleCreateSuccessResponse
		 * @param {String} sWorkOrder - project order
		 * @param {String} sSucMsg - success message
		 */
		_fnHandleCreateSuccessResponse: function (sWorkOrder, sSucMsg) {
			var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD),
				bCreateEvent = oLabOrdModel.getProperty("/CreateEvent");
			var sDialogMessage;

			this.onDialogClose();

			if (!bCreateEvent) {
				sDialogMessage = this.getResourceBundle().getText("workOrderUpdateSuccess");
				sap.ui.controller(Constants.CONT_WODETAILS)._fnFireCancelButton();
				sap.ui.controller(Constants.CONT_WODETAILS)._fnUpdateElementBindings();
			} else {
				var sCheckListErr = oLabOrdModel.getProperty("/sChecklistItemErr"); //PCR032047++
				sCheckListErr = sCheckListErr ? "\n\n" + sCheckListErr : ""; //PCR032047++
				sDialogMessage = this.getResourceBundle().getText("workOrderCreateCreate") + " " + sSucMsg + " '" + sWorkOrder + "'" + sCheckListErr;  //PCR032047++; added sCheckListErr
			}

			oLabOrdModel.setProperty("/bWorkOrderCreated", true);

			this._oFragment.handleCallBackResponse.call(this,
				this._oResourceBundle.getText("successResponseHeader"),
				sDialogMessage
			);
		},

		/**
		 * Error call back function of service order create event
		 * @name handleWorkOrderCreationFail
		 * @param {Object} oError - error response
		 */
		handleWorkOrderCreationFail: function (oError) {
			var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD);

			oLabOrdModel.setProperty("/bWorkOrderCreated", false);
			this.onDialogClose();

			this.handleEventFail(oError);
		},

		/* =========================================================== */
		/* Handle Attachments                                          */
		/* =========================================================== */

		/**
		 * Event handler to display attachments in the given list
		 * @name onFileChanged
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onFileChanged: function (oEvent) {
			var index = 0;
			var that = this;
			var oReader = new FileReader();
			var oAttachments = this._workOrderAttachments;
			var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD);

			if (oAttachments.files.length > 0) {
				index = oAttachments.files.length;
			}

			oAttachments.sFileName = oEvent.getParameter("newValue");
			oAttachments.sFileElementId = oEvent.getParameter("id");

			var oDocument = document.getElementById(oAttachments.sFileElementId + "-fu");

			if (oDocument) {
				var name = oDocument.files[0].name,
					size = oDocument.files[0].size,
					type = oDocument.files[0].type,
					file = oDocument.files[0];

				oAttachments.BASE64_MARKER = "data:" + type + ";base64,";
				oAttachments.files[index] = {
					Filename: name,
					FileSize: size,
					Type: type,
					File: oDocument.files[0],
					BASE64_MARKER: oAttachments.BASE64_MARKER,
					NewFile: true
				};

				oReader.onload = (function (theFile) {
					return function (oEvent) {
						var base64Index = oEvent.target.result.indexOf(oAttachments.BASE64_MARKER) + oAttachments.BASE64_MARKER.length;
						var base64 = oEvent.target.result.substring(base64Index);
						oAttachments.files[index].content = base64;
						oAttachments.files[index].FileName = oAttachments.sFileName;

						if (!oLabOrdModel.getProperty("/CreateEvent")) {
							that.handleAddAttachment(oAttachments.files[index]);
						} else {
							that._fnAddNewAttachment(oAttachments.files[index]);
						}
					};
				})(file);

				oReader.readAsDataURL(file);
			}
		},

		/** 
		 * Internal method to to add new attachment for Work Order
		 * @name _fnAddNewAttachment
		 * @param {Object} oAtt - attachment
		 */
		_fnAddNewAttachment: function (oAtt) {
			var oAttGrid = this.getView().byId(IDH.id.ATTACHMENTS_GRID);
			var oIcon = new sap.ui.core.Icon({
				src: Formatter.formatAttachmentIcon(oAtt.Type)
			}).addStyleClass("spgLabOrdAttIcon");
			var oLink = new sap.m.Link({
				press: this.onPressSpgLabOrdAttachment,
				text: oAtt.Filename
			}).addStyleClass("spgLabOrdMRA");
			var oButton = new sap.m.Button({
				icon: IDH.icons.ICON_DELETE,
				type: sap.m.ButtonType.Default,
				press: this.handleDeleteNewAttachment
			});
			var oHBox = new sap.m.HBox({
					height: "5.25rem",
					width: "100%",
					alignItems: "Center",
					items: [
						oIcon, oLink, oButton
					]
				}).addStyleClass("spgLabOrdP1")
				.addStyleClass("spgLabOrdGridBox")
				.addStyleClass("spgLabOrdAttBox");

			oAttGrid.addContent(oHBox);
		},

		/**
		 * Event handler to open new attachment from grid
		 * @name onPressSpgLabOrdAttachment
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onPressSpgLabOrdAttachment: function (oEvent) {
			var oLink = oEvent.getSource();

			if (oLink.getBindingContext()) {
				var oCntx = oLink.getBindingContext().getObject();
				var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD);

				if (!oLabOrdModel.getProperty("CreateEvent")) {
					var sAttUrl = Formatter.formatAttDownloadUrl(oCntx.IServiceCaseNo, oCntx.LoioClass, oCntx.LoioObjid);
					window.open(sAttUrl, "_blank");
				}
			}
		},

		/**
		 * Event handler to delete new attachment from grid
		 * @name handleDeleteNewAttachment
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		handleDeleteNewAttachment: function (oEvent) {
			var oDelBtn = oEvent.getSource();
			var oAttGridItem = oDelBtn.getParent();

			oAttGridItem.getParent().removeContent(oAttGridItem.getId());
		},

		/**
		 * Event handler to display file size exceed message
		 * @name onFileSizeMissmatch
		 * @param {Object} a - change event
		 */
		onFileSizeMissmatch: function (a) {
			this._oFragment.openResponseDialog.call(this, {
				msg: this._oResourceBundle.getText("fileSizeExceeded"),
				statusText: this._oResourceBundle.getText("errorStatusMessage"),
				statusState: sap.ui.core.ValueState.Error
			});
		},

		/**
		 * Event handler to validate file name length
		 * @name onFileNameExceeded
		 */
		onFileNameExceeded: function () {
			this._oFragment.openResponseDialog.call(this, {
				msg: this._oResourceBundle.getText("fileNameLengthExceeded"),
				statusText: this._oResourceBundle.getText("errorStatusMessage"),
				statusState: sap.ui.core.ValueState.Error
			});
		},

		/**
		 * Event handler to upload attachment from the list
		 * @name onUploadAttachment
		 * @param {String} sWorkOrder - Work Order
		 * @param {String} sSuccessMsg - Success Msg
		 */
		onUploadAttachment: function (sWorkOrder, sSuccessMsg) {
			var oModel = this.getOwnerComponent().getModel(),
				aAttachments = this._workOrderAttachments.files;
			var oFileModel = new sap.ui.model.odata.ODataModel(oModel.sServiceUrl);	
			var that = this,
				oFile = {},
				bAttCrt = true,
				iCounter = 0;
				
			this._sSuccessMsg = sSuccessMsg;	

			var oAttRequest = new Promise(function (resolve, reject) {
				for (var i = 0; i < aAttachments.length; i++) {
					oFile.IFileName = aAttachments[i].FileName;
					oFile.Type = "";
					oFile.IFileContentXstring = aAttachments[i].content;
					oFile.IServiceCaseNo = sWorkOrder;

					oFileModel.create("/" + ServiceConfigConstants.attachmentSet, oFile, {
						success: function (oData) {
							++iCounter;

							if (iCounter === aAttachments.length) {
								resolve(oData);
							}
						},
						error: function (oError) {
							++iCounter;
							bAttCrt = false;

							if (iCounter === aAttachments.length || !bAttCrt) {
								resolve(oError);
							}
						}
					});
				}
			});

			oAttRequest.then(function (oData) {
				var oLabOrdModel = that.getOwnerComponent().getModel(Constants.MDL_LABORD);
				
				if (!bAttCrt) {
					that.onShowErrorResponse({}, {
						hdr: that._oResourceBundle.getText("errorResponseHeader"),
						sMsg: that._sSuccessMsg + "\n\n" + that._oResourceBundle.getText("AttachUploadFailed")
					});
					
					oLabOrdModel.setProperty("/bWorkOrderCreated", true);
				} else {
					that._workOrderAttachments.files = [];
					var oFileUploader = that.getView().byId(IDH.id.FILE_UPLOADER);
	
					if (oFileUploader) {
						oFileUploader.setValue("");
					}
					
					that._fnHandleCreateSuccessResponse(sWorkOrder, that._oResourceBundle.getText("Successfully"));
				}
			});
		}

	});

});