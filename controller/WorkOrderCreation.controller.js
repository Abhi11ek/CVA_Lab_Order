/**
 * WorkOrderCreation controller helps in controlling the behaviour 
 * of all the view elements in the WorkOrderCreation View.  
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.ErrorHandler
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 02/10/2021  	Vimal Pandu				PCR033603    Chamber List changes				*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"../extensions/ComboBoxExt",
	"../helper/FragmentHelper",
	"../helper/PersonalizationControl",
	"../model/ModelObjects",
	"../model/ResponseHandler",
	"../util/Constants",
	"../util/EventTriggers",
	"../util/Formatter",
	"../util/IdHelper",
	"../util/Util",
	"../util/ServiceConfigConstants"
], function (BaseController, JSONModel, Filter, FilterOperator, Device, ComboBoxExt, FragmentHelper, PersonalizationControl, ModelObj,
	ResponseHandler, Constants, EventTriggers, Formatter, IDH, Util, ServiceConfigConstants) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.WorkOrderCreation", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);

			BaseController.prototype.createViewModel.call(that, {
				sModelName: Constants.MDL_CRTVIEW,
				busy: false,
				delay: 0,
				bCaseCreated: false,
				sPbg: "", //PCR032047++
				sToolId: "" //PCR032047++ 
			});

			that._oWorkOrderElements = {
				Input: [
					IDH.id.SERIALNO_INP,
					IDH.id.TITLE_INP,
					IDH.id.CREATION_DATE_INP,
					IDH.id.REQ_START_DATE_DTPKR,
					IDH.id.WORK_DESC_TXTARA
				],
				ComboBox: [
					IDH.id.CHMB_TYP_CMBX,
					IDH.id.TOOL_STAT_CMBX,
					IDH.id.CATEGORY_CMBX,
					IDH.id.PRIORITY_CMBX,
					IDH.id.STATUS_CMBX,
					IDH.id.REASON_CMBX,
					IDH.id.MOC_CMBX,
					IDH.id.GSR_CMBX,
					IDH.id.ABATE_CMBX,
					IDH.id.CHEM_AUTH_CMBX,
					IDH.id.PASR_CMBX,
					IDH.id.FSR_CMBX,
					IDH.id.PBG_CMBX, //PCR032047++
					IDH.id.HOURS_CMBX, //PCR035112++
					IDH.id.MIN_CMBX //PCR035112++
				],
				Switch: [
					IDH.id.MOC_SWITCH,
					IDH.id.GSR_SWITCH,
					IDH.id.ABATE_SWITCH,
					IDH.id.CHEM_AUTH_SWITCH,
					IDH.id.PASR_SWITCH,
					IDH.id.FSR_SWITCH
				]
			};

			that.oPersonalization = new PersonalizationControl(); //PCR032047++

			that.getView().addEventDelegate({
				onAfterShow: function () {
					//Scroll to Initial Position
					this.getView().byId(IDH.id.WO_CREATE_VIEW).scrollTo(0);
					that.onReadVariant(); //PCR032047++
				}.bind(this)
			});

			that._fnClearAttachments();
			that._showFormFragment(Constants.PROP_CRT_FRAG);
			that.getRouter().getRoute(Constants.ROUTE_WOCREATION).attachPatternMatched(that._onObjectMatched, that);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler to navigate back to Master View
		 * @name onNavBack
		 */
		onNavBack: function () {
			var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD),
				bNavToCrtBfrLoad = oLabOrdModel.getProperty("/bNavToCrtBfrLoad"),
				bWorkOrderCreated = oLabOrdModel.getProperty("/bWorkOrderCreated");

			oLabOrdModel.setProperty("/bWorkOrderCreated", bNavToCrtBfrLoad || bWorkOrderCreated);
			this.getRouter().navTo(Constants.ROUTE_WORKORDERS);
		},

		/**
		 * Event handler for Combobox elements
		 * @name onComboBoxSelectionChange
		 * @param {sap.ui.base.Event} oEvent - Selection change event
		 */
		onComboBoxSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource();
			ComboBoxExt.prototype.onChange.call(this, oCmbx);
		},

		//Start of PCR032047-- changes

		/**
		 * Event handler to clear all the fields
		 * upon change in the value
		 * @name onToolIdLiveChange //oEvent047
		 */
		/*onToolIdLiveChange: function (oEvent) {
			var oLabOrdModel = that.getModelFromComponent(Constants.MDL_LABORD),
				oToolId = oLabOrdModel.getProperty("/oToolId");
			var oInput = oEvent.getSource(),
				sToolId = oInput.getValue();

			if (sToolId && oToolId.Serialnumber && sToolId !== oToolId.Serialnumber) {
				that._fnFilterChamberType("$");
				that._fnClearCreateElements();
			}

			if (sToolId) {
				oInput.setValueState(sap.ui.core.ValueState.None);
			}
		},*/

		//End of PCR032047-- changes

		/**
		 * Event handler to fetch Customer Tool ID Data
		 * upon change in the value
		 * @name onInputChangeFetchToolData
		 */
		onInputChangeFetchToolData: function () { //PCR032047-; removed oEvent
			// var oInput = oEvent.getSource(),  //PCR032047--
			var oInput = this.getView().byId(IDH.id.SERIALNO_INP), //PCR032047++
				sToolId = oInput.getValue(),
				oBinding = oInput.getBinding("suggestionItems");
			var afilters = [
				new Filter(Constants.FIL_CUSTTOOLID, FilterOperator.EQ, ""),
				new Filter(Constants.FIL_SERIALNUMBER, FilterOperator.EQ, sToolId),
				new Filter(Constants.FIL_SRV_CASE_TYP, FilterOperator.EQ, "ZPRJ"),
				new Filter(Constants.FIL_FABID, FilterOperator.EQ, ""),
				new Filter(Constants.FIL_TIMESTAMP, FilterOperator.EQ, new Date())
			];

			if (sToolId) {
				oInput.setBusyIndicatorDelay(0);
				oInput.setBusy(true);
				oBinding.filter(afilters);
				oBinding.attachEventOnce(Constants.EM_DATA_RCVD,
					function (oData) {
						var aResults = oData.getParameter(Constants.PROP_DATA).results;
						oInput.setBusy(false);

						if (aResults[0].ErrorMessage) {
							that._oFragment.openResponseDialog.call(that, {
								msg: aResults[0].ErrorMessage,
								statusText: that._oResourceBundle.getText("errorStatusMessage"),
								statusState: sap.ui.core.ValueState.Error
							});

							//Clear Create ELements
							// that._fnClearCreateElements(); //PCR032047--
							that._fnClearElementsOnToolNameChange(true); //PCR032047++
						} else if (oData.getParameter(Constants.PROP_DATA).results.length > 1) {
							var oDialog = that._oFragment.createDialogFragment.call(that, Constants.FRAG_TOOLID);
							ResponseHandler.handleSuccessResponse(
								oData.getParameter(Constants.PROP_DATA).results,
								Constants.MDL_TOOLID,
								that
							);
							oDialog.open();
						} else {
							that._fnOnSelectToolIdItem(oData.getParameter(Constants.PROP_DATA).results[0]);
						}
					}
				);
			}
		},

		/**
		 * Event handler to Search Tool ID Data
		 * @name handleToolIdSearch
		 * @param {sap.ui.base.Event} oEvent - search event
		 */
		handleToolIdSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value"),
				oBinding = oEvent.getParameter("itemsBinding");
			var aFilters = [];

			if (sValue) {
				aFilters = new Filter({
					filters: [
						new Filter(Constants.FIL_FABNAME, FilterOperator.Contains, sValue),
						new Filter(Constants.FIL_EQUIPMENT1, FilterOperator.Contains, sValue)
					],
					and: false
				});
			}

			oBinding.filter(aFilters);
		},

		/**
		 * Event handler to select Tool ID Data
		 * @name handleToolIdSelect
		 * @param {sap.ui.base.Event} oEvent - Selection change event
		 */
		handleToolIdSelect: function (oEvent) {
			var oToolItem = oEvent.getParameter("selectedItem");

			if (oToolItem) {
				that._fnOnSelectToolIdItem(oToolItem.getBindingContext(Constants.MDL_TOOLID).getObject());
			}
		},

		/** 
		 * Event handler for Pre Task Check List Combo box elements
		 * @name onPreTaskCmbxSelectionChange
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onPreTaskCmbxSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource(),
				sSelKey = oCmbx.getSelectedKey();
			
			//Start of PCR032047-- changes
			
			/*aParentBox = oCmbx.getParent().getParent().getCells();
			oText = aParentBox[0],
			oSwitch = aParentBox[1].getItems()[1];
			

			if (sSelKey === that._oResourceBundle.getText("noDataAvailable") && !oSwitch.getState()) {
				oCmbx.setSelectedKey("");
			}
			
			if (sSelKey === that._oResourceBundle.getText("noDataAvailable") && oSwitch.getState()) {
				oSwitch.setState(false);
				BaseController.prototype.messageToast.call(that, oText.getText() + " " + that._oResourceBundle.getText("noDataAvailable"));
			}*/
			
			if (sSelKey === that._oResourceBundle.getText("noDataAvailable")) {
				oCmbx.setSelectedKey("");
			}
			
			ComboBoxExt.prototype.onChange.call(this, oCmbx);
			
			//End of PCR032047++ changes
		},

		/** 
		 * Event handler for Pre Task Check List switch elements
		 * @name onPreTaskMandSwitchChange
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onPreTaskMandSwitchChange: function (oEvent) {
			var oSwitch = oEvent.getSource(),
				aParentBox = oSwitch.getParent().getParent().getItems(),
				// oText = aParentBox[0], //PCR032047--
				oCmbx = aParentBox[1],
				sSelKey = oCmbx.getSelectedKey();

			if (sSelKey === that._oResourceBundle.getText("noDataAvailable")) {
				//Start of PCR032047++ changes
				oCmbx.setSelectedKey("");
				/*oSwitch.setState(false);
				BaseController.prototype.messageToast.call(that, oText.getText() + " " + that._oResourceBundle.getText("noDataAvailable"));*/
				//End of PCR032047++ changes
			}
		},

		/** 
		 * Event handler for Create Work Order Submit button 
		 * @name onPressCreateWorkOrder
		 */
		onPressCreateWorkOrder: function () {
			var oLabOrdModel = that.getModelFromComponent(Constants.MDL_LABORD);
			var bValidateInputs = that._oUtil.validateInputElements.call(that, [
					IDH.id.SERIALNO_INP,
					IDH.id.TITLE_INP,
					IDH.id.REQ_START_DATE_DTPKR,
					IDH.id.WORK_DESC_TXTARA
				]),
				bValidateComboboxes = that._oUtil.validateComboBoxElements.call(that, [
					IDH.id.CHMB_TYP_CMBX,
					IDH.id.CATEGORY_CMBX,
					IDH.id.PBG_CMBX, //PCR032047++
					IDH.id.HOURS_CMBX, //PCR035112++
					IDH.id.MIN_CMBX //PCR035112++
				]);

			//Validate Pre Task Check List Items
			var bHasValidCheckListItem = this._fnValidateCheckListItems();

			//Start of PCR032047-- changes	

			/*if (!bHasValidCheckListItem) {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("provideAllDetailToContinue"));
				return;
			}*/

			//End of PCR032047-- changes

			if (bValidateInputs && bValidateComboboxes.valid) {
				//Start of PCR032047++ changes	
				var sCheckListItems = "";
				oLabOrdModel.setProperty("/sChecklistItemErr", "");

				if (bHasValidCheckListItem && !bHasValidCheckListItem.valid) {
					for (var sKey in bHasValidCheckListItem.key) {
						if (!bHasValidCheckListItem.key[sKey]) {
							sCheckListItems += ((sKey !== "Abatement" || sKey !== "ChemAuth") ? sKey.toUpperCase() : sKey) + ": " + that._oResourceBundle.getText(
								"checkListErrCreation") + ",\n";
						}
					}

					oLabOrdModel.setProperty("/sChecklistItemErr", sCheckListItems ? sCheckListItems.substr(0, sCheckListItems.length - 2) : "");

					sap.m.MessageBox.warning(that._oResourceBundle.getText("checkListWarning"), {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						emphasizedAction: sap.m.MessageBox.Action.OK,
						onClose: function (sAction) {
							if (sAction === sap.m.MessageBox.Action.OK) {
								//Add AssignTo for create event
								oLabOrdModel.setProperty("/oToolId/Assignedto", oLabOrdModel.getProperty("/RequestedbyId"));
								BaseController.prototype.handleWorkOrderCreation.call(that);
							}
						}
					});
				} else {
					//End of PCR032047++ changes
					// Add AssignTo for create event
					oLabOrdModel.setProperty("/oToolId/Assignedto", oLabOrdModel.getProperty("/RequestedbyId"));
					BaseController.prototype.handleWorkOrderCreation.call(that);
				} //PCR032047++
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("provideAllDetailToContinue"));
			}
		},

		/** 
		 * Event handler for Create Work Order Cancel button 
		 * @name onPressCancelWorkOrderCreation
		 */
		onPressCancelWorkOrderCreation: function () {
			that.onNavBack();
		},

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				bWorkOrderCreated = oLabOrdModel.getProperty("/bWorkOrderCreated");
			that._oFragment.destroyDialog.call(that);

			if (bWorkOrderCreated) {
				that.onNavBack();
			}
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
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);
			var oView = that.getView(),
				oWorkDetailsGrid = oView.byId(IDH.id.WO_DET_GRID),
				oToolInformationGrid = oView.byId(IDH.id.TOOL_INFO_GRID);

			//Read User Name and Id from Fiori Launchpad
			var sUsername = that.getUserName(),
				sUserId = that.getUserId();

			oLabOrdModel.setProperty("/bWorkOrderCreated", false);
			oLabOrdModel.setProperty("/GridDefaultSpan", "L3 M3 S12");
			oLabOrdModel.setProperty("/WorkDescSpan", "L9 M6 S12");
			oLabOrdModel.setProperty("/AttachmentsSpan", "L4 M6 S12");
			oLabOrdModel.setProperty("/CreateEvent", true);
			oLabOrdModel.setProperty("/RequestedbyName", sUsername ? sUsername : "");
			oLabOrdModel.setProperty("/RequestedbyId", sUserId ? sUserId : "");

			oLabOrdModel.updateBindings();

			//Clear Create ELements
			that._fnClearCreateElements();

			//Hide Reason Combobox
			if (!oWorkDetailsGrid.hasStyleClass(Constants.STYLE_HIDEREASON)) {
				oWorkDetailsGrid.addStyleClass(Constants.STYLE_HIDEREASON);
			}

			//Hide Tool Status Combobox
			if (!oToolInformationGrid.hasStyleClass(Constants.STYLE_HIDETOOL)) {
				oToolInformationGrid.addStyleClass(Constants.STYLE_HIDETOOL);
			}
		},

		/**
		 * Internal method to insert Read/Edit fragment
		 * @name _showFormFragment
		 * @param {string} sFragmentName - fragment reference
		 */
		_showFormFragment: function (sFragmentName) {
			var oVLayout = that.byId(IDH.id.WO_CREATE_LAYOUT);

			oVLayout.removeAllContent();
			oVLayout.insertContent(that._getFormFragment(sFragmentName));
		},

		/**
		 * Property which holds Work Order View/Edit fragments
		 * @name _formFragments
		 */
		_formFragments: {},

		/**
		 * Property which holds Work Order Attachments
		 * @name _formFragments
		 */
		_workOrderAttachments: {},

		/**
		 * Internal method to display Read/Edit fragment
		 * @name _getFormFragment
		 * @param {string} sFragmentName - fragment reference
		 * @returns {Object} fragment object
		 */
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = that._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(
				that.getView().getId(),
				Constants.FRAG_SUMM + sFragmentName,
				that
			);

			that._formFragments[sFragmentName] = oFormFragment;
			return that._formFragments[sFragmentName];
		},

		/**
		 * Internal method to clear values/selections/state of 
		 * Work Order create elements
		 * @name _fnClearCreateElements
		 */
		_fnClearCreateElements: function () {
			var oView = that.getView();
			var oLabOrdModel = that.getModelFromComponent(Constants.MDL_LABORD);
			var aElements = that._oWorkOrderElements.Input.concat(that._oWorkOrderElements.ComboBox);

			oLabOrdModel.setProperty("/oToolId", {});
			oLabOrdModel.setProperty("/MOC", []);
			oLabOrdModel.setProperty("/GSR", []);
			oLabOrdModel.setProperty("/Abatement", []);
			oLabOrdModel.setProperty("/ChemAuth", []);
			oLabOrdModel.setProperty("/PASR", []);
			oLabOrdModel.setProperty("/FSR", []);

			//Clear Elements State
			that._oUtil.setValueStateForElementsWithIDs.call(that, aElements, sap.ui.core.ValueState.None);

			//Clear Inputs
			that._oUtil.clearElementsWithIDs.call(that, aElements.concat([
				IDH.id.TOOL_NAME_INP
			])); //PCR032047++; added concat

			//Clear Comboboxes
			that._oUtil.clearSelectedItemInComboBox.call(that, that._oWorkOrderElements.ComboBox);

			//Clear Switches
			that._oUtil.clearSwitchStates.call(that, that._oWorkOrderElements.Switch);

			//Clear Attachments
			that._fnClearAttachments();

			//Enable Tool Id Input in create event
			oView.byId(IDH.id.SERIALNO_INP).setEditable(false); //PCR032047--; changed true to false

			//Show Reason only when Work Status id 'DELAYED'
			this.getView().byId(IDH.id.REASON_BOX).setVisible(false);

			//Default Work Status to 'ON-TRACK' while Work Order Creation
			oView.byId(IDH.id.STATUS_CMBX).setSelectedKey(Constants.PROP_ONTRACK);

			//Set requested start date as current date
			var oDate = new Date();
			oView.byId(IDH.id.REQ_START_DATE_DTPKR).setMinDate(new Date(oDate.setDate(oDate.getDate() - 1)));

			//Start of PCR032047++ changes

			//Enable Pbg Input in create event
			oView.byId(IDH.id.PBG_CMBX).setEditable(true);

			//Enable Tool Name Input in create event
			oView.byId(IDH.id.TOOL_NAME_INP).setEnabled(true);

			//Clear Tool Names
			oLabOrdModel.setProperty("/aToolName", []);
			
			//Clear Chamber Selection
			that._fnFilterChamberType("$"); //PCR033603++; added $

			//End of PCR032047++ changes
			
			//Start of PCR033677++ changes
			
			jQuery.sap.delayedCall(1500, that, function () {
				$('input[id*="idReqStartDate-inner').attr('disabled', true);
			});
			
			var oLabOrdModel = that.getModel(Constants.MDL_LABORD);
			oLabOrdModel.setProperty("/BuildingNo", "");
			
			//End of PCR033677++ changes
		},

		/**
		 * Internal method to fetch Chamber Type dropdown values
		 * @name _fnFilterChamberType
		 * @param {String} sEquipment - equipment number
		 */
		_fnFilterChamberType: function (sEquipment) {
			var oView = that.getView(),
				oChamCmbx = oView.byId(IDH.id.CHMBTYP_CMBX);

			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.CHMBTYP_CMBX, Constants.PROP_ITEMS
			);
			
			//Start of PCR032047++ changes
			
			var aFilters = [];
			
			if (sEquipment) {
				// Start of PCR033603++ changes
				// aFilters.push(new Filter(Constants.FIL_CUSTTOOL_ID, FilterOperator.EQ, sEquipment));
				aFilters.push(new Filter(Constants.FIL_PROCESS_TYP, FilterOperator.EQ, "ZCMO"));
				aFilters.push(new Filter(Constants.FIL_EQUIPMENT, FilterOperator.EQ, sEquipment));
				// End of PCR033603++ changes
			}
			
			oChamCmbx.getBinding(Constants.PROP_ITEMS).filter(aFilters);
			
			/*oChamCmbx.getBinding(Constants.PROP_ITEMS).filter([
				new Filter(Constants.FIL_PROCESS_TYP, FilterOperator.EQ, "ZCMO")
			]);*/
			
			//End of PCR032047++ changes
		},

		/**
		 * Internal method to display customer tool id data
		 * @name _fnOnSelectToolIdItem
		 * @param {Object} oToolIdCntx - Customer Tool ID context
		 */
		_fnOnSelectToolIdItem: function (oToolIdCntx) {
			var oLabOrdModel = that.getModelFromComponent(Constants.MDL_LABORD);

			//Get Chamber Type dropdown values
			// that._fnFilterChamberType(oToolIdCntx.Serialnumber); //PCR032047--; changed Equipment to  Serialnumber; PCR033603--
			that._fnFilterChamberType(oToolIdCntx.Equipment); //PCR033603++

			//Get Pre-TaskChecklist dropdown values
			//that._fnGetToolData(oToolIdCntx.Serialnumber); //PCR033677--
			

			if (oToolIdCntx.Soldtopartydescription) {
				oToolIdCntx.Soldtoparty1 = oToolIdCntx.Soldtopartydescription;
			}

			oLabOrdModel.setProperty("/oToolId", oToolIdCntx);
			oLabOrdModel.updateBindings();
			BaseController.prototype._fnGetToolData.call(this, oToolIdCntx.Serialnumber, "create"); //PCR033677++
		},

		/**
		 * Internal method to clear attachments in create view
		 * @name _fnClearAttachments
		 */
		_fnClearAttachments: function () {
			var oView = this.getView(),
				oAttGrid = oView.byId(IDH.id.ATTACHMENTS_GRID),
				oFileUploader = oView.byId(IDH.id.FILE_UPLOADER);

			this._workOrderAttachments.files = [];

			oAttGrid.removeAllContent();

			if (oFileUploader) {
				oFileUploader.setValue("");
			}
		},

		/**
		 * Internal method to validate pre task check list items
		 * @name _fnValidateCheckListItems
		 * @returns {Object} pre task list valid data
		 */
		_fnValidateCheckListItems: function () {
			var oProp = {
				Gsr: "GsrMandtFlag",
				Abatement: "AbatementMandtFlag",
				Pasr: "PasrMandtFlag",
				Fsr: "FsrMandtFlag",
				Moc: "MocMandtFlag",
				ChemAuth: "CauthMandtFlag"
			};
			var aMandElems = [];
			// bHasValidData = true; //PCR032047--
			var oView = this.getView();
			var sKey, oValid;

			for (sKey in oProp) {
				if (oView.byId(oProp[sKey]).getState()) {
					aMandElems.push(sKey);
				}
			}

			if (aMandElems.length) {
				oValid = this._oUtil.validateComboBoxElements.call(this, aMandElems);
				// bHasValidData = oValid.valid; //PCR032047--
			}

			// return bHasValidData; //PCR032047--
			return oValid; //PCR032047++
		},

		//Start of PCR032047++ changes

		/** 
		 * Event handler for PGB Combobox selection change
		 * @name onPbgSelectionChange
		 * @param {sap.ui.base.Event} oEvent - sel change event
		 */
		onPbgSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource(),
				sSelKey = oCmbx.getSelectedKey();
			var oViewModel = this.getView().getModel(Constants.MDL_CRTVIEW);
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);
			var oToolListModel = that.getComponent().getModel(Constants.MDL_TOOLDATA),
				aTools = oToolListModel.getProperty("/d/results");
			var aToolName = [];

			if (!sSelKey || (oViewModel.getProperty("/sPbg") && sSelKey !== oViewModel.getProperty("/sPbg"))) {
				aToolName = [];
				that._fnClearElementsOnToolNameChange(true);
				that._fnFilterChamberType("$"); //PCR033603++; added $
				oCmbx.setSelectedKey(sSelKey);
			}

			aToolName = aTools.filter(function (oItem) {
				return oItem.Pbg === sSelKey ? oItem : undefined;
			});

			oViewModel.setProperty("/sPbg", sSelKey);
			oLabOrdModel.setProperty("/aToolName", aToolName);

			if (this.oPersonalization.hasShellCont && sSelKey) {
				var oVariantData = oLabOrdModel.getProperty("/oVariantData");
				var oVariantProp = {
					key: "0",
					name: Constants.PROP_VAR_NAME,
					def: true
				};

				if (oVariantData && oVariantData.Pbg !== sSelKey) {
					oVariantData.Pbg = sSelKey;
					oLabOrdModel.setProperty("/bToolElemBusy", true);

					this.oPersonalization.saveVariant.call(this, oVariantProp, oVariantData, function (oData) {
						oLabOrdModel.setProperty("/bToolElemBusy", false);
					});
				}
			}

			ComboBoxExt.prototype.onChange.call(this, oCmbx);
		},

		/** 
		 * Event handler for Tool name seacrh field Search event
		 * @name onSearchToolName
		 * @param {sap.ui.base.Event} oEvent - Search event
		 */
		onSearchToolName: function (oEvent) {
			var oItem = oEvent.getParameter("suggestionItem");
			var oView = that.getView();
			var oSerialNo = oView.byId(IDH.id.SERIALNO_INP);
			var oViewModel = this.getView().getModel(Constants.MDL_CRTVIEW),
				sToolId = oViewModel.getProperty("/sToolId");

			if (oItem) {
				if (sToolId && (sToolId !== oItem.getKey())) {
					that._fnClearElementsOnToolNameChange(false);
				}
				
				oEvent.getSource()._blur();
				oSerialNo.setValue(oItem.getKey());
				oViewModel.setProperty("/sToolId", oItem.getKey());
				that.onInputChangeFetchToolData();
			}

			if (oEvent.getParameter("clearButtonPressed")) {
				oEvent.getSource()._blur();
				that._fnClearElementsOnToolNameChange(false);
				that._fnFilterChamberType("$"); //PCR033603++; added $
			}
		},

		/** 
		 * Event handler for Tool name seacrh field suggest event
		 * @name onSuggestToolName
		 * @param {sap.ui.base.Event} oEvent - Search event
		 */
		onSuggestToolName: function (oEvent) {
			var oToolName = oEvent.getSource();
			var sValue = oEvent.getParameter("suggestValue");
			var aFilters = [];

			if (sValue) {
				aFilters = [
					new Filter([
						new Filter(Constants.FIL_TOOL_DESC, function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						}),
						new Filter(Constants.FIL_TOOL_ID, function (sDes) {
							return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			oToolName.getBinding("suggestionItems").filter(aFilters);
			oToolName.suggest();
		},

		/**
		 * Method helps in retrieving variant data
		 * @name onReadVariant
		 */
		onReadVariant: function () {
			if (this.oPersonalization.hasShellCont) {
				var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

				this.oPersonalization.getAllVariants.call(this, function (aVariants) {
					var aFilVariant = aVariants.filter(function (oItem) {
						return oItem.VariantName === Constants.PROP_VAR_NAME ? oItem : null;
					});

					if (aFilVariant[0] && aFilVariant[0].VariantKey) {
						this.oPersonalization.getVariantFromKey.call(this,
							aFilVariant[0].VariantKey,
							function (oVariantData) {
								var oFilter = oVariantData.getItemValue(Constants.PROP_FILTER),
									sPbg = oFilter.Pbg ? oFilter.Pbg : "";

								oLabOrdModel.setProperty("/oVariantData", oFilter);
								that.getView().byId(IDH.id.PBG_CMBX).setSelectedKey(sPbg);
								that._fnGetToolListData();
							});
					} else {
						var oVariantData = {
							IvCategory: "",
							IvCreatedBy: "",
							IvPrjname: "",
							IvSerialNumber: "",
							IvServiceCaseNo: "",
							Pbg: "",
							idAdvCreatedByInp: "",
							idAdvSrhStatus: ""
						};

						that._fnGetToolListData();
						oLabOrdModel.setProperty("/oVariantData", oVariantData);
					}
				}.bind(this));
			} else {
				this._fnGetToolListData();
			}
		},

		/** 
		 * Internal method to fetch Tool Data
		 * @name _fnGetToolListData
		 */
		_fnGetToolListData: function () {
			var oWorkOrderEvt = new ModelObj(Constants.MOBJ_OEVENT);
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			oLabOrdModel.setProperty("/bToolElemBusy", true);

			oWorkOrderEvt.sEventType = ServiceConfigConstants.get;
			oWorkOrderEvt.sEvent = EventTriggers.TRIGGER_TOOLDATA_READ;
			oWorkOrderEvt.sEventSuccss = EventTriggers.TOOLDATA_READ_SUCCESS;
			oWorkOrderEvt.sEventError = EventTriggers.TOOLDATA_READ_FAIL;
			oWorkOrderEvt.sGetEntitySetPath = "/" + ServiceConfigConstants.toolListSet;
			oWorkOrderEvt.sModelName = Constants.MDL_TOOLDATA;
			oWorkOrderEvt.sSuccessHandler = "handleToolDataFetchSuccess";
			oWorkOrderEvt.sErrorHandler = "handleToolDataFetchError";
			this.finishoDataModelregistartionProcessWithParams(oWorkOrderEvt);
		},

		/**
		 * Success call back function for tool list read event
		 * @name handleToolDataFetchSuccess
		 * @param {Object} oSuccess - success response
		 */
		handleToolDataFetchSuccess: function (oSuccess) {
			var oPbgCmbx = that.getView().byId(IDH.id.PBG_CMBX);
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);
			var oToolListModel = that.getComponent().getModel(Constants.MDL_TOOLDATA),
				aTools = oToolListModel.getProperty("/d/results");
			var aPbg = [],
				aPbgVal = [];

			aPbg = aTools.map(function (oItem) {
				if (aPbg.indexOf(oItem.Pbg) < 0) {
					aPbg.push(oItem.Pbg);
					aPbgVal.push(oItem);
				}
			});

			oLabOrdModel.setProperty("/bToolElemBusy", false);
			oLabOrdModel.setProperty("/aTools", aTools);
			oLabOrdModel.setProperty("/aPbg", aPbgVal);
			oLabOrdModel.setProperty("/aToolName", []);

			if (oPbgCmbx.getSelectedKey()) {
				oPbgCmbx.fireSelectionChange();
			}
		},

		/**
		 * Error call back function for tool list read event
		 * @name handleToolDataFetchError
		 * @param {Object} oError - error response
		 */
		handleToolDataFetchError: function (oError) {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			oLabOrdModel.setProperty("/bToolElemBusy", false);

			that.handleEventFail(oError, {
				hdr: that._oResourceBundle.getText("errorResponseHeader"),
				sMsg: oError.getParameter("d").ErrorMessage
			});
		},

		/** 
		 * Internal Event to filter Tool Names
		 * @name _fnFilterToolName
		 */
		_fnFilterToolName: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				aToolName = oLabOrdModel.getProperty("/aToolName");
			var oTlNmCmbx = that.getView().byId(IDH.id.TOOL_NAME_INP);
			var sToolName = oTlNmCmbx.getValue();

			var oItemTemplate = new sap.ui.core.Item({
				key: "{labOrd>ToolId}",
				text: "{labOrd>ToolId} - {labOrd>ToolDesc}"
			});

			if (sToolName) {
				oTlNmCmbx.getAggregation("picker").open();
				sToolName = sToolName.toLowerCase();

				var aNewNames = aToolName.filter(function (oItem) {
					var sDesc = oItem.ToolDesc.toLowerCase(),
						sId = oItem.ToolId.toLowerCase();

					return (sDesc.indexOf(sToolName) > -1 || sId.indexOf(sToolName) > -1 || (sId + " - " + sDesc).indexOf(sToolName) > -1) ? oItem :
						undefined;
				});

				oLabOrdModel.setProperty("/aToolNameNew", aNewNames);
				oTlNmCmbx.bindItems("labOrd>/aToolNameNew", oItemTemplate);
			} else {
				oTlNmCmbx.bindItems("labOrd>/aToolName", oItemTemplate);
				oTlNmCmbx.getAggregation("picker").close();
			}
		},

		/** 
		 * Internal Event to clear Work Order Elements 
		 * on Tool Name change event
		 * @name _fnClearElementsOnToolNameChange
		 * @param {Bool} bIncludeToolName - Flag to include tool name element
		 */
		_fnClearElementsOnToolNameChange: function (bIncludeToolName) {
			var oLabOrdModel = that.getModelFromComponent(Constants.MDL_LABORD);
			var aInputs = [
				IDH.id.SERIALNO_INP
			];
			var aCmbx = [
				IDH.id.CHMBTYP_CMBX,
				IDH.id.MOC_CMBX,
				IDH.id.GSR_CMBX,
				IDH.id.ABATE_CMBX,
				IDH.id.CHEM_AUTH_CMBX,
				IDH.id.PASR_CMBX,
				IDH.id.FSR_CMBX
			];
			var aElements = aInputs.concat(aCmbx);
			
			if (bIncludeToolName) {
				aElements.push(IDH.id.TOOL_NAME_INP);
			}

			oLabOrdModel.setProperty("/oToolId", {});
			oLabOrdModel.setProperty("/MOC", []);
			oLabOrdModel.setProperty("/GSR", []);
			oLabOrdModel.setProperty("/Abatement", []);
			oLabOrdModel.setProperty("/ChemAuth", []);
			oLabOrdModel.setProperty("/PASR", []);
			oLabOrdModel.setProperty("/FSR", []);

			//Clear Elements State
			that._oUtil.setValueStateForElementsWithIDs.call(that, [
				IDH.id.SERIALNO_INP,
				IDH.id.CHMBTYP_CMBX
			], sap.ui.core.ValueState.None);

			//Clear Inputs
			that._oUtil.clearElementsWithIDs.call(that, aElements);

			//Clear Comboboxes
			that._oUtil.clearSelectedItemInComboBox.call(that, aCmbx);

			//Clear Switches
			that._oUtil.clearSwitchStates.call(that, that._oWorkOrderElements.Switch);
		}

		//End of PCR032047++ changes

	});

});