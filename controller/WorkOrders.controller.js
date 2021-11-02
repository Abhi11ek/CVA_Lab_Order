/**
 * WorkOrders controller helps in controlling the behaviour 
 * of all the view elements in the WorkOrders View.  
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.WorkOrders
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 02/01/2021  	Vimal Pandu				PCR033603    Completion Date changes			*
 * 02/26/2021  	Vimal Pandu				PCR033677    Phase - 3 changes					*
 * 05/19/2021  	Nageswar V				PCR035112    Phase - 4 changes					*
 * ------------------------------------------------------------------------------------ */
sap.ui.define([
	"./BaseController",
	"./ErrorHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"../libs/jszip",
	"../libs/xlsx",
	"../helper/FragmentHelper",
	"../helper/PersonalizationControl",
	"../model/ModelObjects",
	"../util/Util",
	"../util/EventTriggers",
	"../util/Formatter",
	"../util/Constants",
	"../util/IdHelper",
	"../util/ServiceConfigConstants"
], function(BaseController, ErrorHandler, JSONModel, Filter, FilterOperator, Device, jszip, xlsx, FragmentHelper, PersonalizationControl,
	ModelObj, Util, EventTriggers, Formatter, Constants, IDH, ServiceConfigConstants) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.WorkOrders", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the workOrders table controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function() {
			that = this;

			// Control state model
			var oList = that.byId(IDH.id.WORKORDERS_LIST),
				oViewModel = that._createViewModel();
			var oComponent = this.getComponent();
			var iCounter = 0;

			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._oErrorHandler = new ErrorHandler(this, Constants.EM_ERR_HNDLR);
			that.oPersonalization = new PersonalizationControl(); //PCR032047++
			that._oList = oList;

			that._fnClearFilters();
			that.setModel(oViewModel, Constants.MDL_WOVIEW);

			oList.attachEventOnce("updateFinished", function() {
				oViewModel.setProperty("/delay", 0);
			});

			that.getView().addEventDelegate({
				onAfterShow: function() {
					that._fnGetToolNames(); //PCR033677++
					
					if (oComponent.getComponentData()) {
						var oStartupParam = oComponent.getComponentData().startupParameters;
						
						if (!iCounter && oStartupParam.hasOwnProperty("workorder")) {
							++iCounter;
							that._oListFilterState.aSearch = [new Filter(Constants.FIL_SERV_NO, FilterOperator.EQ, "*" + oStartupParam.workorder[0] +
								"*")]; //PCR032047++; added "*"
							that._applyFilterSearch();
						} else if (!iCounter) {
							// that._fnGetWorkOrdersCount([]); //PCR032047--
							that.onReadVariant(false); //PCR032047++
						}
					} else if (!iCounter) {
						// that._fnGetWorkOrdersCount([]); //PCR032047--
						that.onReadVariant(false); //PCR032047++
					}

					that.getView().byId(IDH.id.WO_SCRL_CNT).addStyleClass(Constants.STYLE_SCRL_H1); //PCR032047++
				}
			});

			that.getView().addEventDelegate({
				onBeforeFirstShow: function() {
					that.getOwnerComponent().oListSelector.setBoundMasterList(oList);
				}.bind(that)
			});

			that.getRouter().getRoute(Constants.ROUTE_WORKORDERS).attachPatternMatched(that._onWorkOrderMatched, that);
			that.getRouter().attachBypassed(that.onBypassed, that);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler of close button, when the triggered request throws
		 * an error.
		 * @name onRequestCompleted
		 */
		onRequestCompleted: function() {
			var oViewModel = that.getModel(Constants.MDL_WOVIEW),
				oDialogModel = that.getComponent().getModel(Constants.MDL_DIALOG);
			var bNavToCrtBfrLoad = oViewModel.getProperty("/bNavToCrtBfrLoad");

			oDialogModel.setProperty("/bMessageOpen", false);

			if (!that._oList.getItems().length && !Device.system.phone && !bNavToCrtBfrLoad) {
				that.getRouter().navTo(Constants.ROUTE_WOAVAIL);
			}
		},

		/**
		 * Event handler to navigate to Work Order Creation view.
		 * @name onCreateWorkOrder
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onCreateWorkOrder: function(oEvent) {
			var oCrtBtn = oEvent.getSource();
			var oModel = that.getModel(),
				oViewModel = that.getModel(Constants.MDL_WOVIEW);

			if (oModel.hasPendingRequests()) {
				var oNavToCreation = new Promise(function(resolve, reject) {
					oCrtBtn.setBusy(true);

					oModel.refreshSecurityToken(function() {
						var aPendingRequestHandles = oModel["aPendingRequestHandles"];
						var oReq;

						oViewModel.setProperty("/bNavToCrtBfrLoad", true);
						oCrtBtn.setBusy(false);

						for (oReq in aPendingRequestHandles) {
							aPendingRequestHandles[oReq].abort();
						}

						resolve();

					}, function(oError) {
						BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("errorText"));
					}, true);
				});

				oNavToCreation.then(function() {
					that.getRouter().navTo(Constants.ROUTE_WOCREATION);
				});
			} else {
				oViewModel.setProperty("/bNavToCrtBfrLoad", false);
				that.getRouter().navTo(Constants.ROUTE_WOCREATION);
			}
		},

		/**
		 * Event handler for the workOrders search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the table binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function(oEvent) {
			// Start of PCR033677++ changes
		
			var sQuery = oEvent.getParameter("query").toLowerCase();
			var aItems = that._oList.getItems();
			
			aItems.map(function(oItem) {
				var oCntx = oItem.getBindingContext().getObject(),
					bValidOrder = oCntx.Equipmentdescription.toLowerCase().indexOf(sQuery) > -1 || oCntx.Servicecasenumber.toLowerCase().indexOf(sQuery) > -1;
				
				oItem.setVisible(bValidOrder);
			});

			
			this._oList.fireUpdateFinished(); //PCR035112++
			
			// End of PCR033677++ changes
			
			 if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// that is visible if you select any workOrders table item.
				// In that case no new search is triggered, we only
				// refresh the table binding.
				 that.onRefresh();
				 return;
			 }
			
			// Start of PCR033677-- changes

			/*var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				that._oListFilterState.aSearch = [new Filter(Constants.FIL_QCK_SRH, FilterOperator.EQ, "*" + sQuery + "*")]; //PCR032047++; added "*"
			} else {
				that._oListFilterState.aSearch = [];
			}

			that._applyFilterSearch();*/
			
			// End of PCR033677-- changes
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the table binding.
		 * @public
		 */
		onRefresh: function() {
			that._fnClearFilters();
			that._applyFilterSearch();
		},

		/**
		 * Event handler top open advanced search fragment.
		 * @onPressAdvancedSearch
		 */
		onPressAdvancedSearch: function() {
			that._oAdvSrhFrag = that._oFragment.createDialogFragment.call(that, Constants.FRAG_ADVSRH);
			that.onPressResetAdvanceSearchFields();
			that._oAdvSrhFrag.open();
			that.onReadVariant(true); //PCR032047++
		},

		/**
		 * Internal helper method to clear advance search filters
		 * @name onPressResetAdvanceSearchFields
		 */
		onPressResetAdvanceSearchFields: function() {
			var aAdvSrh = [
				Constants.FIL_CATEGORY,
				Constants.FIL_TITLE,
				Constants.FIL_SERIALNO,
				Constants.FIL_CREATEDBY,
				Constants.FIL_SERV_NO,
				Constants.EM_FLT_FRSTNM,
				Constants.EM_FLT_LSTNM,
				Constants.EM_FLT_USERID,
				Constants.FIL_TOOLNAME //PCR033677++
			];
			var oViewModel = that.getModel(Constants.MDL_WOVIEW);
			var sKey;

			for (sKey in aAdvSrh) {
				oViewModel.setProperty("/" + aAdvSrh[sKey], "");
			}
			
			//Start of PCR032047++ changes
			
			if (oViewModel.getProperty("/idAdvCreatedByInp")) {
				oViewModel.setProperty("/idAdvCreatedByInp", "");
			}
			
			//End of PCR032047++ changes

			var oView = that.getView();

			oView.byId(IDH.id.ADV_CREATEDBY_INP).setValue("");
			oView.byId(IDH.id.ADSRH_STAT_MULINP).clearSelection();
		},

		/**
		 * that method is to validate the enter Service Case number is of typer number.
		 * @name handleNumberInputValue
		 * @param {sap.ui.base.Event} oEvent - event handler object
		 */
		handleNumberInputValue: function(oEvent) {
			var rAlphabetRegex = Constants.INP_VALID_REGEX,
				oElement = oEvent.getSource(),
				sNumber = oElement.getValue().trim();

			if (!rAlphabetRegex.test(sNumber.substr(-1))) {
				oElement.setValue(sNumber.replace(sNumber.substr(-1), ""));
			}
		},

		/**
		 * that method is to post assigned to details to fetch details of the Assigned to person.
		 * @name onPressEmpListSearch
		 */
		onPressEmpListSearch: function() {
			var oView = that.getView(),
				oAdvSearchNavCon = oView.byId(IDH.id.ADV_SEARCH_NAV_CONT),
				oEmpListView = oView.byId(IDH.id.ADV_SEARCH_ASSIGNEDTO_RESULTS),
				oViewModel = that.getModel(Constants.MDL_WOVIEW);
			var aEmpFil, oBinding;

			that._oEmpTable = oView.byId(IDH.id.ADV_EMPTABLE);
			oBinding = that._oEmpTable.getBinding(Constants.PROP_ITEMS);
			aEmpFil = that._fnFetchAdvSrhFilters([
				Constants.EM_FLT_FRSTNM,
				Constants.EM_FLT_LSTNM,
				Constants.EM_FLT_USERID
			], "Emp"); //PCR032047++; added "Emp"

			if (aEmpFil.length > 0) {
				oViewModel.setProperty("/bShowMsgStrip", false);

				oAdvSearchNavCon.to(oEmpListView);
				oBinding.filter(aEmpFil);

				BaseController.prototype.validateDataReceived.call(
					that, IDH.id.ADV_EMPTABLE, Constants.PROP_ITEMS
				);

				oBinding.attachEventOnce(Constants.EM_DATA_RCVD, function() {
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
		onSelectEmpItem: function() {
			var oView = that.getView(),
				oList = oView.byId(IDH.id.ADV_EMPTABLE),
				oSelItem = oList.getSelectedItem();

			if (oSelItem) {
				var oSelectedItem = oSelItem.getBindingContext().getObject();
				var oAdvSearchNavCon = oView.byId(IDH.id.ADV_SEARCH_NAV_CONT);

				that.getModel(Constants.MDL_WOVIEW).setProperty("/IvCreatedBy", oSelectedItem.Userid);
				that.getModel(Constants.MDL_WOVIEW).setProperty("/" + IDH.id.ADV_CREATEDBY_INP, oSelectedItem.Firstname + " " + oSelectedItem.Lastname); //PCR032047++
				oView.byId(IDH.id.ADV_CREATEDBY_INP).setValue(oSelectedItem.Firstname + " " + oSelectedItem.Lastname);
				oAdvSearchNavCon.backToPage(oAdvSearchNavCon.getInitialPage());
			}
		},

		/**
		 * that method if for handling advance search in master view.
		 * @name handleAdvanceSearch
		 */
		handleAdvanceSearch: function() {
			that._fnClearFilters();
			that._oListFilterState.aFilter = that._fnFetchAdvSrhFilters([
				Constants.FIL_SERIALNO,
				Constants.FIL_CREATEDBY,
				Constants.FIL_SERV_NO,
				Constants.FIL_TITLE,
				Constants.FIL_CATEGORY,
				Constants.FIL_TOOLNAME //PCR033677++
			], ""); //PCR032047++; added ""

			if (that._oListFilterState.aFilter.length > 0) {
				try {
					// that._applyFilterSearch(); //PCR032047--
					that._fnShowSavedSearches(that._oListFilterState.aFilter); //PCR032047++
					that._oAdvSrhFrag.close();
				} catch (e) {
					that._oAdvSrhFrag.close();
				}
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("advSrchErrMsg"));
			}
		},

		/**
		 * Event handler to sort Work Orders.
		 * @name onPressSortWorkOrders
		 */
		onPressSortWorkOrders: function() {
			var oViewModel = this.getModel(Constants.MDL_WOVIEW),
				sSorted = oViewModel.getProperty("/sSorted");

			oViewModel.setProperty("/sSorted", sSorted === "D" ? "A" : "D");
			// this._oList.setGrowingThreshold(200);  //PCR033677--

			that._fnClearFilters();
			that._oListFilterState.aSearch = [new Filter("IvSortOrder", FilterOperator.EQ, oViewModel.getProperty("/sSorted"))];
			that._applyFilterSearch();
		},

		/**
		 * Event handler for the table selection event
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @name onSelectionChange
		 */
		onSelectionChange: function(oEvent) {
			//Start of PCR032047++ changes
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				bShowDetailContentBtn = oLabOrdModel.getProperty("/bShowDetailContentBtn");

			if (!bShowDetailContentBtn) {
				sap.ui.controller(Constants.CONT_WODETAILS).fireSideContentBtn();
			}
			//End of PCR032047++ changes	

			// get the table item, either from the tableItem parameter or from the event's source itself (will depend on the device-dependent mode).
			that._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the workOrders table, that selection is removed.
		 * @name onBypassed
		 */
		onBypassed: function() {
			that._oList.removeSelections(true);
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @name onNavBack
		 */
		onNavBack: function() {
			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
				var oCrossAppNavigator = sap.ushell.Container.getService(Constants.CAN_SRV);

				oCrossAppNavigator.toExternal({
					target: {
						shellHash: Constants.SEMOBJ_SHELL
					}
				});
			}
		},

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function() {
			that._oFragment.destroyDialog.call(that);
		},
		
		//Start of PCR033677++ changes
		
		/**
		 * After list data is available, this handler method updates the
		 * master list counter and hides the pull to refresh control, if
		 * necessary.
		 * @name onWorkOrdersListUpdateFinished
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onWorkOrdersListUpdateFinished: function(oEvent) {
			var sTitle;
			var oViewModel = this.getModel(Constants.MDL_WOVIEW);
			// only update the counter if the length is final
			
			if (this._oList.getBinding(Constants.PROP_ITEMS).isLengthFinal()) {
				//Start of PCR035112++ changes
				//sTitle = that.getResourceBundle().getText("workOrdersTitleCount", [oEvent.getParameter(Constants.PROP_TOTAL)]);
				var iCount = oEvent.getParameter(Constants.PROP_TOTAL) ? oEvent.getParameter(Constants.PROP_TOTAL) : oEvent.getSource().getVisibleItems().length;
				sTitle = that.getResourceBundle().getText("workOrdersTitleCount", [iCount]);
				//End of PCR035112++ changes
				oViewModel.setProperty("/title", sTitle);
			}
			
			//Start of PCR035112++ changes
			else if (this._oList.getBinding(Constants.PROP_ITEMS)) {
				var iCount = oEvent.getSource().getVisibleItems().length;
				sTitle = that.getResourceBundle().getText("workOrdersTitleCount", [iCount]);
				oViewModel.setProperty("/title", sTitle);
			}
			//End of PCR035112++ changes
		},
		
		//End of PCR033677++ changes

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_createViewModel: function() {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: " ",
				noDataText: that.getResourceBundle().getText("workOrdersListNoDataText"),
				sSorted: "D",
				IvCreatedBy: "",
				bShowMsgStrip: false,
				bNavToCrtBfrLoad: false,
				bTitleBusy: false, //PCR033677++
				//Start of PCR032047++ changes
				bShowSearchHeader: false,
				bShowSavedSearches: true, 
				sSegBtnSelKey: "History",
				oAdvSrhCrt: {
					IvCategory: "",
					IvCreatedBy: "",
					IvPrjname: "",
					IvSerialNumber: "",
					IvServiceCaseNo: "",
					idAdvCreatedByInp: "",
					idAdvSrhStatus: "",
					ToolName: "" //PCR033677++
				}
				//End of PCR032047++ changes
			});
		},
		
		//Start of PCR033677-- changes

		/**
		 * Internal method to retrieve the count of Work Orders
		 * @name _fnGetWorkOrdersCount
		 * @param {Object[]} aFilters - Work Order Filters
		 * @private
		 */
		/*_fnGetWorkOrdersCount: function(aFilters) {
			//Start of PCR032047++ changes
			// var oModel = that.getModel();
			var oModel = new sap.ui.model.odata.ODataModel(that.getModel().sServiceUrl);
			//End of PCR032047++ changes
			var oViewModel = that.getModel(Constants.MDL_WOVIEW);
			var sTitle;

			oModel.read("/" + ServiceConfigConstants.workOrderSet + "/$count", {
				async: true,
				filters: aFilters,
				success: function(oData, oReponse) {
					var iCount = parseInt(oReponse.body ? oReponse.body : 0, 10); //PCR032047-- changed odata to oReponse.body
					sTitle = that.getResourceBundle().getText("workOrdersTitleCount", [iCount]);
					oViewModel.setProperty("/title", iCount > 0 ? sTitle : "");
				},
				error: function(oError) {
					oViewModel.setProperty("/title", "");
				}
			});
		},*/
		
		//End of PCR033677-- changes

		/**
		 * If the workOrders route was hit (empty hash) we have to set
		 * the hash to to the first item in the table as soon as the
		 * tableLoading is done and the first item in the table is known
		 * @private
		 */
		_onWorkOrderMatched: function() {
			var oViewModel = this.getModel(Constants.MDL_WOVIEW),
				bNavToCrtBfrLoad = oViewModel.getProperty("/bNavToCrtBfrLoad");

			var oLabOrdModel = this.getModelFromComponent(Constants.MDL_LABORD),
				bWorkOrderCreated = oLabOrdModel.getProperty("/bWorkOrderCreated");

			if (bNavToCrtBfrLoad || bWorkOrderCreated) {
				oLabOrdModel.setProperty("/bWorkOrderCreated", false);
				that.onRefresh();
				return;
			}

			that.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
				function(mParams) {
					if (mParams.list.getMode() === "None") {
						return;
					}
					that._showDetail(mParams.firstListitem);
				}.bind(that),
				function(mParams) {
					if (mParams.error || bNavToCrtBfrLoad) {
						if (bNavToCrtBfrLoad) {
							oViewModel.setProperty("/bNavToCrtBfrLoad", false);
						}
						return;
					}
					that.getRouter().navTo(Constants.ROUTE_WOAVAIL);
				}.bind(that)
			);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;
			that.getRouter().navTo(Constants.ROUTE_WODETAILS, {
				objectId: oItem.getBindingContext().getProperty("Servicecasenumber")
			}, bReplace);
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function() {
			var aFilters = that._oListFilterState.aSearch.concat(that._oListFilterState.aFilter),
				oViewModel = that.getModel(Constants.MDL_WOVIEW),
				oDialogModel = that.getComponent().getModel(Constants.MDL_DIALOG);
			var oBinding = that._oList.getBinding(Constants.PROP_ITEMS);
			
			// that._fnGetWorkOrdersCount(aFilters); PCR033677--

			oViewModel.setProperty("/bShowSearchHeader", false); //PCR032047++
			that._fnAdjustScrollContHeight(); //PCR032047++

			var oFilterReq = new Promise(function(fnResolve, fnReject) {
				oBinding.filter(aFilters, "Application");
				// oBinding.attachEventOnce(Constants.EM_DATA_RCVD, function (oData) { PCR032047--
				oBinding.attachDataReceived(function(oData) { //PCR032047++
					if (oData.getParameter(Constants.PROP_DATA) && (!oData.getParameter(Constants.PROP_DATA) || !that._oList.getItems().length)) {
						fnReject({
							list: that._oList,
							error: true
						});
					}
					var oFirstListItem = that._oList.getItems()[0];
					if (oFirstListItem) {
						fnResolve({
							list: that._oList,
							firstListitem: oFirstListItem
						});
						// } else { PCR032047--
					} else if (oData.getParameter(Constants.PROP_DATA) && !oFirstListItem) { //PCR032047++
						fnReject({
							list: that._oList,
							error: false
						});
					}
				});
			});

			oFilterReq.then(
				function(mParams) {
					var oScrollCont = that.getView().byId("idWOScrollCont");
					// that._oList.setGrowingThreshold(20); //PCR033677--

					if (mParams.list.getMode() === "None") {
						return;
					}

					that._showDetail(mParams.firstListitem);
					that._oList.setSelectedItem(mParams.firstListitem);
					oScrollCont.scrollToElement(mParams.firstListitem);
				}.bind(that),
				function(mParams) {
					if (mParams.error && !oDialogModel.getProperty("/bMessageOpen")) {
						that.getRouter().navTo(Constants.ROUTE_WOAVAIL);
					}
				}.bind(that)
			);

			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", that.getResourceBundle().getText("workOrdersListNoDataWithFilterOrSearchText"));
			} else if (that._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", that.getResourceBundle().getText("workOrdersListNoDataText"));
			}
		},

		/**
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
		 * @private
		 */
		_applyGroupSort: function(aSorters) {
			that._oList.getBinding(Constants.PROP_ITEMS).sort(aSorters);
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function(sFilterBarText) {
			var oViewModel = that.getModel(Constants.MDL_WOVIEW);
			oViewModel.setProperty("/isFilterBarVisible", (that._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", that.getResourceBundle().getText("workOrdersFilterBarText", [sFilterBarText]));
		},

		/**
		 * Internal helper method to fetch advance search filters
		 * @name _fnFetchAdvSrhFilters
		 * @param {Object[]} aArr - filters
		 * @param {Object} sEvt - event ref
		 * @returns {Object[]} aFilArr - filters
		 */
		_fnFetchAdvSrhFilters: function(aArr, sEvt) { //PCR032047++; added sEvt
			var oViewModel = that.getModel(Constants.MDL_WOVIEW), //PCR032047++
				oVMData = oViewModel.getData(), //PCR032047--
			//	var oVMData = that.getModel(Constants.MDL_WOVIEW).getData(),
				aFilArr = [];
			var oMulInpData = that._fnGetValFromTokens([
				IDH.id.ADSRH_STAT_MULINP
			]);
			var oAdvSrhCrt = {}; //PCR032047++
			var sFil;

			for (sFil in aArr) {
				oAdvSrhCrt[aArr[sFil]] = oVMData[aArr[sFil]]; //PCR032047++
				
				if (oVMData[aArr[sFil]]) {
					//Start of PCR032047++ changes
					if (aArr[sFil] === Constants.FIL_TITLE) {
						aFilArr.push(new Filter(aArr[sFil], FilterOperator.EQ, oVMData[aArr[sFil]]));
					} else {
						//End of PCR032047++ changes	
						aFilArr.push(new Filter(aArr[sFil], FilterOperator.EQ, oVMData[aArr[sFil]]));
					}
				}
			}
			
			oAdvSrhCrt.IvCreatedBy = oViewModel.getProperty("/IvCreatedBy"); //PCR032047++
			
			if (oMulInpData[IDH.id.ADSRH_STAT_MULINP] && !sEvt) { //PCR032047++ added && !sEvt
				aFilArr.push(new Filter(Constants.FIL_STATUS, FilterOperator.EQ, oMulInpData[IDH.id.ADSRH_STAT_MULINP]));
				oAdvSrhCrt[IDH.id.ADSRH_STAT_MULINP] = oMulInpData[IDH.id.ADSRH_STAT_MULINP]; //PCR032047++
			}
			
			//Start of PCR032047++ changes
			
			oViewModel.setProperty("/oAdvSrhCrt", oAdvSrhCrt);
			oViewModel.setProperty("/oAdvSrhCrt/" + IDH.id.ADV_CREATEDBY_INP, oViewModel.getProperty("/" + IDH.id.ADV_CREATEDBY_INP));
			oViewModel.setProperty("/oAdvSrhCrt/idAdvCategory", that.getView().byId(IDH.id.ADV_CATE_CMBX).getValue());
			
			//End of PCR032047++ changes

			return aFilArr;
		},

		/**
		 * An internal method to fetch values from the given given multi-inputs. 
		 * @name _fnGetValFromTokens
		 * @param {Object[]} aMulInp - multi-input ids
		 * @returns {Object} oMulInp - multi-input data object
		 */
		_fnGetValFromTokens: function(aMulInp) {
			var sElementId, oToken, aTokens, aValues;
			var oMulInpData = {};

			for (sElementId in aMulInp) {
				aTokens = that.getView().byId(aMulInp[sElementId]).getSelectedItems();
				aValues = [];

				for (oToken in aTokens) {
					aValues.push(aTokens[oToken].getKey());
				}

				oMulInpData[aMulInp[sElementId]] = (aValues.length) ? aValues.sort().join("$") : ""; //PCR032047++; added .sort()
			}

			return oMulInpData;
		},

		/**
		 * Internal helper method to clear filters
		 * @name _fnClearFilters
		 */
		_fnClearFilters: function() {
			that._oListFilterState = {
				aFilter: [],
				aSearch: []
			};
		},

		//Start of PCR032047++ changes
		
		/**
		 * Event handler for handling search criteria on Advance Search dialog
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @name onAdvSrchSegBtnSelectionChange
		 */
		onAdvSrchSegBtnSelectionChange: function(oEvent) {
			var oSegBtn = oEvent.getSource(),
				sSelBtn = oSegBtn.getSelectedKey();
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oVariantData = oLabOrdModel.getProperty("/oVariantData");
			var oViewModel = that.getModel(Constants.MDL_WOVIEW),
				oAdvSrhCrt = oViewModel.getProperty("/oAdvSrhCrt");
			var oFilter = sSelBtn === "Save" ? oVariantData : oAdvSrhCrt;
			
			that._fnSetVariantData(oFilter);
		},

		/**
		 * Internal method to adjust the height of Scroll Container
		 * @name _fnAdjustScrollContHeight
		 */
		_fnAdjustScrollContHeight: function() {
			var oViewModel = that.getModel(Constants.MDL_WOVIEW),
				bShowSearchHeader = oViewModel.getProperty("/bShowSearchHeader");
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				bShowDetailContentBtn = oLabOrdModel.getProperty("/bShowDetailContentBtn");
			var oWOCont = that.getView().byId(IDH.id.WO_SCRL_CNT);

			oWOCont.removeStyleClass(Constants.STYLE_SCRL_H1);
			oWOCont.removeStyleClass(Constants.STYLE_SCRL_H2);
			oWOCont.removeStyleClass(Constants.STYLE_SCRL_H3);
			oWOCont.removeStyleClass(Constants.STYLE_SCRL_H4);
			// Start of PCR033677++ changes
			oWOCont.removeStyleClass(Constants.STYLE_SCRL_CNT1);
			oWOCont.removeStyleClass(Constants.STYLE_SCRL_CNT3);
			that.getView().byId(IDH.id.SCL_CNT_MST_LIST).removeStyleClass(Constants.STYLE_SCRL_CNT2);
			// End of PCR033677++ changes
			
			if (!bShowDetailContentBtn && bShowSearchHeader) {
				oWOCont.addStyleClass(Constants.STYLE_SCRL_H3);
			} else if (!bShowDetailContentBtn && !bShowSearchHeader) {
				oWOCont.addStyleClass(Constants.STYLE_SCRL_H4);
			} else if (bShowDetailContentBtn && !bShowSearchHeader) {
				oWOCont.addStyleClass(Constants.STYLE_SCRL_H1);
			} else {
				oWOCont.addStyleClass(Constants.STYLE_SCRL_H2);
			}
			
			// Start of PCR033677++ changes
			if (!bShowDetailContentBtn) {
				that.getView().byId(IDH.id.SCL_CNT_MST_LIST).addStyleClass(Constants.STYLE_SCRL_CNT2);
				oWOCont.addStyleClass(Constants.STYLE_SCRL_CNT3);
			} else {
				oWOCont.addStyleClass(Constants.STYLE_SCRL_CNT1);
			}
			// End of PCR033677++ changes
		},

		/**
		 * Event handler to download work orders
		 * @name onPressDownloadWorkOrders
		 */
		onPressDownloadWorkOrders: function() {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new sap.m.Dialog({
					showHeader: false,
					content: [
						new sap.m.Text({
							text: that.getResourceBundle().getText("downloading")
						}).addStyleClass("spgLabOrdWorkOrdDownloadLabel"),
						new sap.m.Button({
							type: sap.m.ButtonType.Transparent,
							icon: IDH.icons.ICON_REJECT,
							press: function() {
								this.oDefaultDialog.close();
							}.bind(this)
						}).addStyleClass("spgLabOrdWorkOrdDownloadBtn")
					]
				}).addStyleClass("spgLabOrdWorkOrdDownloadPopup");

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
			$(IDH.id.DIAL_POPUP).hide();

			var oWorkOrderEvt = new ModelObj(Constants.MOBJ_OEVENT);

			oWorkOrderEvt.sEventType = ServiceConfigConstants.get;
			oWorkOrderEvt.sEvent = EventTriggers.TRIGGER_WKORD_READ;
			oWorkOrderEvt.sEventSuccss = EventTriggers.WKORD_READ_SUCCESS;
			oWorkOrderEvt.sEventError = EventTriggers.WKORD_READ_FAIL;
			oWorkOrderEvt.sGetEntitySetPath = "/" + ServiceConfigConstants.workOrderSet;
			oWorkOrderEvt.aFilterParams = this._oList.getBinding("items").aApplicationFilters;
			oWorkOrderEvt.sModelName = Constants.MDL_WORKORDERS;
			oWorkOrderEvt.sSuccessHandler = "handleWorkOrdersFetchSuccess";
			oWorkOrderEvt.sErrorHandler = "handleWorkOrdersFetchError";
			this.finishoDataModelregistartionProcessWithParams(oWorkOrderEvt);
		},

		/**
		 * Success call back function for download work orders event
		 * @name handleWorkOrdersFetchSuccess
		 * @param {Object} oSuccess - success response
		 */
		handleWorkOrdersFetchSuccess: function(oSuccess) {
			that.oDefaultDialog.close();
			$(IDH.id.DIAL_POPUP).show();

			var oWorkOrdersModel = this.getModel(Constants.MDL_WORKORDERS),
				aItems = oWorkOrdersModel.getProperty("/d/results");

			var aWorkOrdersTemplate = aItems.map(function(oItem) {
				return {
					"Work Order ID": oItem.Servicecasenumber,
					"Tool Name": oItem.Equipmentdescription,
					"Chamber": oItem.Assembly,
					"WO Title": oItem.Projname,
					"Work Description": oItem.Problemdescription, //PCR035112++
					"Requested Start Date": that.formatter.dateFormat(oItem.Startdatetime) + 
											" " + that.formatter.formatTime(oItem.Startdatetime), //PCR033677++
					//"Creation Date": that.formatter.dateFormat(oItem.CreatedDateTimeStr) //PCR033677++
					"Creation Date": that.formatter.dateFormat(oItem.CreatedDateTimeStr) + 
											" " + that.formatter.formatTime(oItem.CreatedDateTimeStr), //PCR033677++
					"Completion Date": ((oItem.CompletionDateTime !== "0") ? (that.formatter.dateFormat(oItem.CompletionDateTime) 
										+ " " + that.formatter.formatTime(oItem.CompletionDateTime)) : ""), //PCR033677++
					// Start of PCR035112++ changes
					/*"WO Phase": (oItem.Orderstatus === Constants.STATUS_OPEN || oItem.Orderstatus === Constants.STATUS_RELEASED) ?
						Constants.STATUS_INPROGRESS : oItem.Orderstatus,*/
					"WO Phase": oItem.OrderStatusTxt,
					// End of PCR035112++ changes
					"Work Status": oItem.WorkStatus,
					"Tool ID": oItem.Serialnumber,
					"Priority": oItem.Prioritydesc,
					"BU": oItem.Pbg,
					"Category": oItem.Category2Desc,
					//Start of PCR033677++ changes
					"Staging Required": oItem.StagingNo.length > 0 ? Constants.PROP_YES : "",
					"Staging Request #": oItem.StagingNo,
					"Service Technicians": oItem.ServiceTechs,
					//End of PCR033677++ changes
					"": ""
				};
			});

			var oWorkSheet = XLSX.utils.json_to_sheet(aWorkOrdersTemplate);
			var oWorkBook = XLSX.utils.book_new();

			XLSX.utils.book_append_sheet(oWorkBook, oWorkSheet, Constants.WORK_ORD_TEMPLATE);
			var sFileName = Constants.WORK_ORD_FILENAME;
			XLSX.writeFile(oWorkBook, sFileName);
		},

		/**
		 * Error call back function for download work orders event
		 * @name handleWorkOrdersFetchError
		 * @param {Object} oError - error response
		 */
		handleWorkOrdersFetchError: function(oError) {
			that.oDefaultDialog.close();
			$(IDH.id.DIAL_POPUP).show();

			that.handleEventFail(oError, {
				hdr: that._oResourceBundle.getText("errorResponseHeader"),
				sMsg: oError.getParameter("d").ErrorMessage
			});
		},

		/**
		 * Method helps in saving variant data
		 * @name onSaveVariants
		 */
		onSaveVariants: function() {
			if (this.oPersonalization.hasShellCont) {
				var oVariantProp = {
					key: "0",
					name: Constants.PROP_VAR_NAME,
					def: true
				};
				var aArr = [
					Constants.FIL_SERIALNO,
					Constants.FIL_CREATEDBY,
					Constants.FIL_SERV_NO,
					Constants.FIL_TITLE,
					Constants.FIL_CATEGORY,
					Constants.TOOL_NAME //PCR033677++
				];
				var oVMData = that.getModel(Constants.MDL_WOVIEW).getData();
				var oMulInpData = that._fnGetValFromTokens([
						IDH.id.ADSRH_STAT_MULINP
					]),
					oFilterData = {};
				var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);
				var sFil;

				for (sFil in aArr) {
					oFilterData[aArr[sFil]] = oVMData[aArr[sFil]] ? oVMData[aArr[sFil]] : "";
				}
				
				var sStat = oMulInpData[IDH.id.ADSRH_STAT_MULINP];
				sStat = sStat.split("$").sort().join("$");

				oFilterData = jQuery.extend(oFilterData, {
					idAdvSrhStatus: sStat ? sStat : "",
					idAdvCreatedByInp: that.getView().byId(IDH.id.ADV_CREATEDBY_INP).getValue(),
					idAdvCategory: that.getView().byId(IDH.id.ADV_CATE_CMBX).getValue(),
					Pbg: oLabOrdModel.getProperty("/oVariantData/Pbg") ? oLabOrdModel.getProperty("/oVariantData/Pbg") : ""
				});

				oLabOrdModel.setProperty("/bSaveBtnBusy", true);

				this._fnSearchWithVariantData(oFilterData, false);

				this.oPersonalization.saveVariant.call(this, oVariantProp, oFilterData, function(oData) {
					oLabOrdModel.setProperty("/bSaveBtnBusy", false);
					BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("advancedSearchSaveMsg"));
				});
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("ushellContNotAvail"));
			}
		},

		/**
		 * Method helps in retrieving variant data
		 * @name onReadVariant
		 * @param {String} bSetVal - set values in adv. search 
		 */
		onReadVariant: function(bSetVal) {
			if (that.oPersonalization.hasShellCont) {
				that.oPersonalization.getAllVariants.call(that, function(aVariants) {
					var aFilVariant = aVariants.filter(function(oItem) {
						return oItem.VariantName === Constants.PROP_VAR_NAME ? oItem : null;
					});

					if (aFilVariant[0] && aFilVariant[0].VariantKey) {
						that.oPersonalization.getVariantFromKey.call(that,
							aFilVariant[0].VariantKey,
							function(oVariantData) {
								var oFilter = oVariantData.getItemValue(Constants.PROP_FILTER);
								var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

								oLabOrdModel.setProperty("/oVariantData", oFilter);
								
								var oViewModel = that.getModel(Constants.MDL_WOVIEW),
									bShowSavedSearches = oViewModel.getProperty("/bShowSavedSearches"),
									oAdvSrhCrt = oViewModel.getProperty("/oAdvSrhCrt"),
									bHisKeySel = oViewModel.getProperty("/sSegBtnSelKey") === "History";
								
								if (!bShowSavedSearches && bHisKeySel) {
									that._fnSetVariantData(oAdvSrhCrt);
								} else if (bSetVal) {
									that._fnSetVariantData(bHisKeySel ? oAdvSrhCrt : oFilter);
								} else {
									that._fnSearchWithVariantData(oFilter, true);
								}
							});
					}
				}.bind(that));
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("ushellContNotAvail"));
			}
		},

		/**
		 * An internal method to set data to all the elements
		 * in the Advance Search pop-up.
		 * @name _fnSetVariantData
		 * @param {Object} oFilterObj - Response Object
		 * @private
		 */
		_fnSetVariantData: function(oFilterObj) {
			var oView = that.getView();
			var oViewModel = that.getModel(Constants.MDL_WOVIEW);
			var aMulInp = [];

			if (typeof oFilterObj === Constants.PROP_OBJECT) {
				if (oFilterObj.idAdvSrhStatus) {
					aMulInp = (oFilterObj.idAdvSrhStatus.length) ? oFilterObj.idAdvSrhStatus.split("$") : [];
					if (aMulInp.indexOf(Constants.WO_OPEN_STAT) > -1 && aMulInp.indexOf(Constants.WO_REL_STAT) > -1) {
						aMulInp.splice(aMulInp.indexOf(Constants.WO_OPEN_STAT), 1);
						aMulInp.splice(aMulInp.indexOf(Constants.WO_REL_STAT), 1);
						aMulInp.push(Constants.WO_OPEN_STAT + "$" + Constants.WO_REL_STAT);
					}
					
				}

				oView.byId(IDH.id.ADSRH_STAT_MULINP).setSelectedKeys(aMulInp);

				oView.byId(IDH.id.ADV_CREATEDBY_INP).setValue(oFilterObj.idAdvCreatedByInp);
				oViewModel.setData(jQuery.extend(oViewModel.getData(), oFilterObj));
			}
		},

		/**
		 * An internal method to search work orders list
		 * with user variant data.
		 * @name _fnSearchWithVariantData
		 * @param {Object} oFilterObj - Response Object
		 * @param {Bool} bFilter - Filter WO List
		 * @private
		 */
		_fnSearchWithVariantData: function(oFilterObj, bFilter) {
			var oViewModel = that.getModel(Constants.MDL_WOVIEW),
				bMatched = oViewModel.getProperty("/bShowSavedSearches");
			var oView = that.getView(),
				oWOCont = oView.byId(IDH.id.WO_SCRL_CNT),
				oHdrTxt = oView.byId(IDH.id.SRH_HDR_LBL);

			if (typeof oFilterObj === Constants.PROP_OBJECT) {
				var aFilters = [],
					aRedFil = [
						Constants.FIL_PBG,
						Constants.FIL_CREATEDBY,
						IDH.id.ADV_CREATEDBY_INP,
						IDH.id.ADV_CATE_CMBX,
						Constants.FIL_CATEGORY
					];
				var sSearchText = "",
					sStat = "";
				var sKey;

				for (sKey in oFilterObj) {
					if (oFilterObj[sKey]) {
						if (sKey === IDH.id.ADSRH_STAT_MULINP || sKey === "IvStatus") {
							var aStat = oFilterObj[sKey].split("$");
							aStat.map(function(oItem) {
								// Start of PCR035112++ changes
								
								if ((aStat.indexOf("E0001") > -1 || aStat.indexOf("E0002") > -1) && (sStat.indexOf("Approved, ") < 0)) {
									sStat += Constants.STATUS_APPRD + ", ";
								}
								
								// End of PCR035112++ changes
								var oStat = {
									// Start of PCR035112++ changes
									"E0012": Constants.STATUS_REJECTED,
									"E0011": Constants.STATUS_SUBMITTED,
									"SCHDL": Constants.STATUS_SCHEDULED,
									"INPRO": Constants.STATUS_INPROGRESS,
									// "E0001": Constants.STATUS_INPROGRESS,
									// End of PCR035112++ changes
									"E0005": Constants.STATUS_WORKCOMPLETED,
									"E0006": Constants.STATUS_CANCELLED,
									"E0004": Constants.STATUS_CLOSED, //PCR033677++
									
								};

								if (oStat[oItem]) {
									sStat += oStat[oItem] + ", ";
								}
								
								return oItem; //PCR035112++
							});
							
							aFilters.push(new Filter(Constants.FIL_STATUS, FilterOperator.EQ, oFilterObj[sKey]));
						} else if (aRedFil.indexOf(sKey) < 0) {
							sSearchText += oFilterObj[sKey] + ", ";
							aFilters.push(new Filter(sKey, FilterOperator.EQ, oFilterObj[sKey]));
						}

						if (sKey === IDH.id.ADV_CATE_CMBX) {
							sSearchText += oFilterObj[sKey] + ", ";
							aFilters.push(new Filter(Constants.FIL_CATEGORY, FilterOperator.EQ, oFilterObj[Constants.FIL_CATEGORY]));
						}

						if (sKey === IDH.id.ADV_CREATEDBY_INP) {
							sSearchText += oFilterObj[sKey] + ", ";
							aFilters.push(new Filter(Constants.FIL_CREATEDBY, FilterOperator.EQ, oFilterObj[Constants.FIL_CREATEDBY]));
						}
					}
				}

				sSearchText = sSearchText + sStat;

				oWOCont.removeStyleClass(Constants.STYLE_SCRL_H1);
				oWOCont.removeStyleClass(Constants.STYLE_SCRL_H2);
				oWOCont.removeStyleClass(Constants.STYLE_SCRL_H3);
				oWOCont.removeStyleClass(Constants.STYLE_SCRL_H4);

				if (aFilters.length && bFilter) {
					that._fnClearFilters();
					that._oListFilterState.aSearch = aFilters;
					that._applyFilterSearch();
					
					var sSearchTextVal = bMatched ? "Saved Searches : " : "Search Criteria : ";
					
					oViewModel.setProperty("/bShowSearchHeader", true);
					oViewModel.setProperty("/bShowSearchText", sSearchText.length ? (sSearchTextVal + sSearchText.slice(0, sSearchText.length - 2)) :
						"");
					
					var sHdrStyle = bMatched ? "spgLabOrdSearchDetailsBox" : "spgLabOrdSearchDetailsBox1"
					
					oHdrTxt.removeStyleClass("spgLabOrdSearchDetailsBox");
					oHdrTxt.removeStyleClass("spgLabOrdSearchDetailsBox1");
					oHdrTxt.addStyleClass(sHdrStyle);
					oWOCont.addStyleClass(Constants.STYLE_SCRL_H2);
				} else {
					oViewModel.setProperty("/bShowSearchText", "");
					oViewModel.setProperty("/bShowSearchHeader", false);
					oWOCont.addStyleClass(Constants.STYLE_SCRL_H1);
				}
			}
		},

		/**
		 * An internal method to validate search criteria on work orders list
		 * with user variant data.
		 * @name _fnTriggerSavedSearches
		 * @private
		 */
		_fnTriggerSavedSearches: function() {
			var oViewModel = that.getModel(Constants.MDL_WOVIEW),
				bShowSearchHeader = oViewModel.getProperty("/bShowSearchHeader");

			if (bShowSearchHeader) {
				that.onReadVariant(false);
			}
		},

		/**
		 * An internal method to display saved searches banner.
		 * @name _fnShowSavedSearches
		 * @param {Object[]} aFilters - Adv. Search filters
		 * @private
		 */
		_fnShowSavedSearches: function(aFilters) {
			var oPromise = new Promise(function(resolve, reject) {
				if (that.oPersonalization.hasShellCont) {
					that.oPersonalization.getAllVariants.call(that, function(aVariants) {
						var aFilVariant = aVariants.filter(function(oItem) {
							return oItem.VariantName === Constants.PROP_VAR_NAME ? oItem : null;
						});

						if (aFilVariant[0] && aFilVariant[0].VariantKey) {
							that.oPersonalization.getVariantFromKey.call(that,
								aFilVariant[0].VariantKey,
								function(oVariantData) {
									var oFilter = oVariantData.getItemValue(Constants.PROP_FILTER);
									var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

									oLabOrdModel.setProperty("/oVariantData", oFilter);
									resolve(oFilter);
								});
						} 
						// Start of PCR033677++ changes
						else {
							that._applyFilterSearch();
						}
						// End of PCR033677++ changes
					}.bind(that));
				} else {
					that._applyFilterSearch();
					reject();
				}
			});
			
			oPromise.then(function(oFilter) {
				var oViewModel = that.getModel(Constants.MDL_WOVIEW);
				var aDupKeys = ["idAdvSrhStatus", "Pbg", "idAdvCategory", "idAdvCreatedByInp"];
				var oNewFilters = jQuery.extend({}, oFilter);
				var oAdvFil = {},
					bMatched = false,
					iAdvSrch = 0,
					iFil = 0;
				var sKey, oFil, oFilData;
				
				oNewFilters.IvStatus = oFilter.idAdvSrhStatus;

				for (sKey in oNewFilters) {
				    if (aDupKeys.indexOf(sKey) > -1 || !oNewFilters[sKey]) {
				        delete oNewFilters[sKey];
				    }
				    
				    if (oNewFilters[sKey]) {
				    	++iFil; 
				    }
				}

				for (oFil in aFilters) {
					++iAdvSrch;
				    oAdvFil[aFilters[oFil].sPath] = aFilters[oFil].oValue1;
				}
				
				if (iFil !== iAdvSrch) {
					bMatched = false;
					oViewModel.setProperty("/bShowSavedSearches", bMatched);
					oFilData = oViewModel.getProperty("/oAdvSrhCrt");
				} else {
					var obj1 = Object.keys(oAdvFil).sort().reduce(function (result, key) {
				        result[key] = oAdvFil[key];
				        return result;
				    }, {});
				    
				    var obj2 = Object.keys(oNewFilters).sort().reduce(function (result, key) {
				        result[key] = oNewFilters[key];
				        return result;
				    }, {});
				    
				    bMatched = JSON.stringify(obj1) === JSON.stringify(obj2);
				    oViewModel.setProperty("/bShowSavedSearches", bMatched);
				    oFilData = bMatched ? oFilter : oViewModel.getProperty("/oAdvSrhCrt");
				}
				
				that._fnSearchWithVariantData(oFilData, true);
				
			});
		},

		//End of PCR032047++ changes
		// Start of PCR033677++ changes
		
		/**
		 * An internal method to get Tool Names
		 * @name _fnGetToolNames
		 * @private
		 */
		_fnGetToolNames: function() {
			var oViewModel = that.getModel(Constants.MDL_WOVIEW);
			
			oViewModel.setProperty("/bTitleBusy", true);
			
			this.getModel().read("/" + ServiceConfigConstants.toolListSet, {
				success: function(oData) {
					oViewModel.setProperty("/bTitleBusy", false);
					var aNames = [],
						aToolObj = [];

					oData.results.forEach(function(oItem) {
					    if (aNames.indexOf(oItem.ToolDesc) < 0) {
					        aNames.push(oItem.ToolDesc) 
					        aToolObj.push(oItem);
					    }
					});
					
					var oToolNamesModel = new JSONModel(aToolObj);
					that.getOwnerComponent().setModel(oToolNamesModel, Constants.MDL_SUG_ITEMS);
				},
				error: function() {
					oViewModel.setProperty("/bTitleBusy", false);
				}
			})
		}
		
		// End of PCR033677++ changes

	});

});