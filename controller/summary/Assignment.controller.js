/**
 * Assignment controller helps in controlling the behaviour of all the view elements in the Assignment View.  
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.Assignment
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"../BaseController",
	"../../util/Constants",
	"../../util/EventTriggers",
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/ServiceConfigConstants",
	"../../util/Util",
	"../../helper/FragmentHelper",
	"../../model/ModelObjects",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Constants, EventTriggers, Formatter, IDH, ServiceConfigConstants, Util, FragmentHelper, ModelObj, Filter, FilterOperator) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.summary.Assignment", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the App controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._onObjectMatched();

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_ASSIGNMENT, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Event handler helps in opening Add Partners dialog
		 * @name onPressAddTechnician
		 */
		onPressAddTechnician: function () {
			that._oPartnersFrag = that._oFragment.createDialogFragment.call(that, Constants.FRAG_PARTNERS);
			that._fnResetPartnerSearch();
			that._oPartnersFrag.open();
		},
		
		/**
		 * This method will help to navigate back from current view
		 * to previous view in Add Partners fragment.
		 * @name onUserDetailsNavBack
		 */
		onUserDetailsNavBack: function () {
			this.getView().byId(IDH.id.PARTNERS_NAV_CONT).back();
		},

		/**
		 * Event handler helps in searching desired partner
		 * @name onPressEmpListSearch
		 */
		onPressEmpListSearch: function () {
			var oView = that.getView(),
				oAdvSearchNavCon = oView.byId(IDH.id.PARTNERS_NAV_CONT),
				oEmpListView = oView.byId(IDH.id.ADV_SEARCH_ASSIGNEDTO_RESULTS),
				oViewModel = that.getModel(Constants.MDL_ASGNMTVIEW);
			var aEmpFil, oBinding;

			that._oEmpTable = oView.byId(IDH.id.ADV_EMPTABLE);
			oBinding = that._oEmpTable.getBinding(Constants.PROP_ITEMS);
			aEmpFil = that._fnFetchAdvSrhFilters([
				Constants.EM_FLT_FRSTNM,
				Constants.EM_FLT_LSTNM,
				Constants.EM_FLT_USERID
			]);

			if (aEmpFil.length > 0) {
				oViewModel.setProperty("/bShowMsgStrip", false);

				oAdvSearchNavCon.to(oEmpListView);
				oBinding.filter(aEmpFil);

				BaseController.prototype.validateDataReceived.call(
					that, IDH.id.ADV_EMPTABLE, Constants.PROP_ITEMS
				);

				oBinding.attachEventOnce(Constants.EM_DATA_RCVD, function () {
					var aEmpItems = that._oEmpTable.getItems(),
						bShowMsgStrip = (!aEmpItems.length || aEmpItems.length === 1) ? false : true;

					if (aEmpItems.length === 1) {
						that._oEmpTable.setSelectedItem(aEmpItems[0]);
					}

					oViewModel.setProperty("/bShowMsgStrip", bShowMsgStrip);
				});
			} else {
				that.messageToast(that._oResourceBundle.getText("advSrchErrMsg"));
			}
		},
		
		/**
		 * that method is to select line item for assigning service case .
		 * @name onSelectEmpItem
		 */
		onSelectEmpItem: function () {
			var oView = that.getView(),
				oList = oView.byId(IDH.id.ADV_EMPTABLE),
				oSelItem = oList.getSelectedItem();
			var oTechGrid = oView.byId(IDH.id.SERV_TECH_GRID);
			var oViewModel = that.getModel(Constants.MDL_ASGNMTVIEW);
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");

			if (oSelItem) {
				var oSelectedItem = oSelItem.getBindingContext().getObject();
				oViewModel.setProperty("/oNewPartner", {
					Email: oSelectedItem.Email,
					Servicecasenumber: oCntx.Servicecasenumber,
					ServiceTechFlag: "X"
				});
				var oInput = new sap.m.Input({
					width: "100%",
					enabled: false,
					value: oSelectedItem.Firstname + " " + oSelectedItem.Lastname
				});
				var oHBox = new sap.m.HBox({
					width: "100%",
					height: "4.25rem",
					alignItems: "Center",
					items: [
						oInput
					]
				}).addStyleClass("spgLabOrdP1")
				.addStyleClass("spgLabOrdGridBox")
				.addStyleClass("spgLabOrdAddTechBox");
				
				oTechGrid.addContent(oHBox);
				that.onDialogClose();
				that.handleAddNewTechnician();
			}
		},
		
		/** 
		 * Event handler to add desired Technician to Work Order
		 * @name handleAddNewTechnician
		 */
		handleAddNewTechnician: function() {
			var oViewModel = that.getModel(Constants.MDL_ASGNMTVIEW),
				oNewPartner = oViewModel.getProperty("/oNewPartner");
			
			if (oNewPartner) {       	
				that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));
	
				that.getModel().createEntry("/" + ServiceConfigConstants.assignmentsSet, {
					changeSetId: ServiceConfigConstants.assignmentsSet,
					properties: oNewPartner,
					success: that.handleRequestSuccess,
					error: that.handleRequestFail
				});
	
				that.getModel().submitChanges(ServiceConfigConstants.assignmentsSet);
			}
		},
		
		/** 
		 * Event handler to delete added Technician from the grid
		 * @name handleDeleteNewTechnician
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		handleDeleteNewTechnician: function(oEvent) {
			var oTechGrid = oEvent.getSource().getParent().getParent(),
				sId = oEvent.getSource().getParent().getId();
				
			oTechGrid.removeContent(sId);	
		},

		/** 
		 * Event handler to delete Technician from Work Order
		 * @name handleDeletePartner
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		handleDeletePartner: function (oEvent) {
			var oDelBtn = oEvent.getSource(),
				oCntx = oDelBtn.getBindingContext().getObject();
			var oDelPartnerEvt = new ModelObj(Constants.MOBJ_OEVENT);

			that.getModel().metadataLoaded().then(function () {
				var sObjectPath = that.getModel().createKey(ServiceConfigConstants.assignmentsSet, {
					Servicecasenumber: oCntx.Servicecasenumber,
					Email: oCntx.Email,
					Partnernum: "",
					ServiceTechFlag: oCntx.ServiceTechFlag,
					ShiftLeadFlag: oCntx.ShiftLeadFlag,
					LabManagerFlag: oCntx.LabManagerFlag,
					ToolManagerFlag: oCntx.ToolManagerFlag
				});
				that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

				oDelPartnerEvt.sEventType = Constants.DELETE;
				oDelPartnerEvt.sEvent = EventTriggers.TRIGGER_DELETE_PARTNER;
				oDelPartnerEvt.sEventSuccss = EventTriggers.DELETE_PARTNER_SUCCESS;
				oDelPartnerEvt.sEventError = EventTriggers.DELETE_PARTNER_FAIL;
				oDelPartnerEvt.sDeleteEntitySetPath = "/" + sObjectPath;
				oDelPartnerEvt.sSuccessHandler = "handleRequestSuccess";
				oDelPartnerEvt.sErrorHandler = "handleRequestFail";

				that.finishoDataModelregistartionProcessWithParams.call(that, oDelPartnerEvt);
			}.bind(that));
		},

		/** 
		 * Success call back function for Add/Delete Techician
		 * @name handleRequestSuccess
		 * @param {Object} oSuccess - success response
		 * @param {Object} oResponse - event response
		 */
		handleRequestSuccess: function (oSuccess, oResponse) {
			var oViewModel = that.getModel(Constants.MDL_ASGNMTVIEW);
			var sSucMsg = oSuccess.hasOwnProperty("sId") ?
				that._oResourceBundle.getText("partnerDeleteSuccessMessage") : 
				that._oResourceBundle.getText("partnerAddedSuccessMessage");
			var oSucResponse = oResponse ? oResponse : oSuccess;
			
			oViewModel.setProperty("/oNewPartner", undefined);
			
			sap.ui.controller(Constants.CONT_WODETAILS)._fnUpdateElementBindings(); //PCR032047++

			BaseController.prototype.handleEventSuccess.call(that, oSucResponse, {
				sBinding: Constants.PROP_CONTENT,
				sListId: IDH.id.SERV_TECH_GRID,
				hdr: that._oResourceBundle.getText("successResponseHeader"),
				sMsg: sSucMsg
			});
		},

		/** 
		 * Error call back function for Add/Delete Techician
		 * @name handleRequestFail
		 * @param {Object} oError - error response
		 */
		handleRequestFail: function (oError) {
			that.onDialogClose();
			that.handleEventFail(oError);
		},

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			that._oFragment.destroyDialog.call(that);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @name _onObjectMatched
		 * @private
		 */
		_onObjectMatched: function () {
			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_ASGNMTVIEW,
				bShowMsgStrip: false,
				Firstname: "",
				Lastname: "",
				Userid: ""
			});
		},
		
		/** 
		 * Internal helper method to clear partner search filters
		 * @name _fnResetPartnerSearch
		 * @private 
		 */
		_fnResetPartnerSearch: function () {
			var aAdvSrh = [
				Constants.EM_FLT_FRSTNM,
				Constants.EM_FLT_LSTNM,
				Constants.EM_FLT_USERID
			];
			var oViewModel = that.getModel(Constants.MDL_ASGNMTVIEW);
			var sKey;

			for (sKey in aAdvSrh) {
				oViewModel.setProperty("/" + aAdvSrh[sKey], "");
			}
		},
		
		/**
		 * Internal helper method to fetch advance search filters
		 * @name _fnFetchAdvSrhFilters
		 * @param {Object[]} aArr - filters
		 * @returns {Object[]} aFilArr - filters
		 */
		_fnFetchAdvSrhFilters: function (aArr) {
			var oVMData = that.getModel(Constants.MDL_ASGNMTVIEW).getData(),
				aFilArr = [];
			var sFil;

			for (sFil in aArr) {
				if (oVMData[aArr[sFil]]) {
					aFilArr.push(new Filter(aArr[sFil], FilterOperator.EQ, oVMData[aArr[sFil]]));
				}
			}

			return aFilArr;
		}

	});

});