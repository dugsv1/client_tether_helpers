function GETCLIENTS(){
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var output = spreadsheet.getSheetByName('API CT');
    var admin = spreadsheet.getSheetByName('Admin');
    var xWebKey = admin.getRange('B7').getValue();
    var xAccessToken = admin.getRange('B8').getValue();
  
    if (xWebKey == '' || xAccessToken == ''){
    }
  
    var lastrow = output.getLastRow();
    
    if(lastrow > 1){
      output.getRange(2, 1, lastrow - 1, 13).clearContent();
   }
    var offset = 0
    var trigger = 0
    var rows = [], data;
    var params = {
    "headers": {
      'X-Web-Key': xWebKey,
      'X-Access-Token': xAccessToken
      },
    "muteHttpExceptions" : true
    }
    while (trigger == 0){
      Logger.log(offset)
      var url='https://api.clienttether.com/v2/api/read_client_list?limit=100&offset=' + offset*100;
      offset++ 
  
      if (xWebKey != '' || xAccessToken != ''){
        var result = UrlFetchApp.fetch(url, params);
        var json = JSON.parse(result.getContentText());
        
        var TotalRecord = json["data"];
        Logger.log('TotalRecord: ' + TotalRecord.length);
        if (TotalRecord.length < 100){
          //final iteration
          Logger.log('All done')
          trigger = 1
        }
      
        //var groupsNum = Math.ceil(TotalRecord / 100);
        //var groupsNum = admin.getRange(17, 2).getValue();
  
      var json = JSON.parse(result.getContentText());
  
      var dataset = json["data"];
      Logger.log(dataset)
        
      if(typeof(json) === "undefined"){
        return 'Node Not Available';
      } else if(typeof(json) === "object"){
          for(var m = 0; m < dataset.length; m++){
            data = dataset[m];
            //Logger.log('client id: ' + data.client_id)
            if (data.firstName + ' ' + data.lastName != 'No Name Text Added' & data.firstName + ' ' + data.lastName != 'No Name Added by Call'  ){
            rows.push([data.client_id, data.firstName + ' ' + data.lastName, data.address, data.city, data.zip, data.email, data.phone, data.whiteboard, data.deal_size, data.clients_action_plan, data.clients_sales_cycle, data.clients_lead_source, data.created, data.address+' '+data.city+' '+data.zip]);
            }
          } 
        }
      }
    }
    var customerData = rows.reverse();
    output.getRange(2, 1, customerData.length, 14).setValues(customerData);
    output.getRange('A1:A').setNumberFormat("@");
  }
  
  function Update_Clients() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const new_lead = ss.getSheetByName("New Leads");
    const admin = ss.getSheetByName("Admin");
  
    const first_row = admin.getRange("AM2").getValue();
    const num_rows = admin.getRange("AM3").getValue();
    const first_col = admin.getRange("AM4").getValue();
    const num_col = admin.getRange("AM5").getValue();
    const tf_first_row = admin.getRange("AM6").getValue();
    const tf_first_col = admin.getRange("AM7").getValue();
  
    var range = new_lead.getRange(first_row, first_col, num_rows, num_col)
    const values = range.getValues();
    const helper = []
  
    values.forEach((row,i) => {
      if (row[0] != ""){
        var client = {
          "client_id" : row[0],
            "address"	 : row[2],
          "city"	: row[3],
          "zip" : row[4],
            "email"	: row[5],
          "phone"	: row[6],
          "action_plan_id"	: row[13],
          "sales_cycle_id"	: row[14],
        }
         var cleaned = clean(client)
         var string = to_string(cleaned)
        helper.push(string)
      }
    })
  
  /**BUILD THE URLS */
  var urls = [];
  helper.forEach((row, i) => {
    var inner_string = ''
    /** LOOPS THROUGH OUTER ARRAY CONTAININ EACH CUSTOMERS INFO */
    row.forEach((item, j) => {
      /**LOOPS THROUGH EACH ITEM FOR EACH CLIENT */
      Logger.log('i:'+i + '// j:' +j)
      if (/**first loop */ j == 0){
        /**create beginning of link without & */
        inner_string = inner_string.concat(item);
      } else {
        //Logger.log(item)
        /**middle of loop includes & within concat */
        inner_string = inner_string.concat('&',item)
      }
    })
    urls.push(inner_string)
  })
  
  /** ITERATE THROUGH EACH CLIENT AND SUBMIT CLIENT TETHER UPDATE */
  urls.forEach((url,i) => {
    var response = CT_API_update(url)
    Logger.log(response)
  })
  
  var range = new_lead.getRange(first_row, first_col+2, num_rows, num_col-2)
  range.clearContent();
  SpreadsheetApp.flush();
  //GETCLIENTS();
  const tf_range = new_lead.getRange(tf_first_row,tf_first_col, new_lead.getLastRow());
  tf_range.uncheck()
  
  }
  
  /**STRIPS OBJECT OF ALL NULL VALUES */
  function clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
        delete obj[propName];
      }
    }
    return obj
  }
  
  /**CONVERTS OBJECT BACK INTO A FORMATTED ARRAY READY FOR CONVERSION TO URL */
  function to_string(object){
    var keys = [];
    for(var item in object){ 
      keys.push(item+'='+object[item])
    }
    return keys
  }
  
  function CT_API_update(url){
  
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const output = spreadsheet.getSheetByName('API CT');
    const admin = spreadsheet.getSheetByName('Admin');
    const xWebKey = admin.getRange('B7').getValue();
    const xAccessToken = admin.getRange('B8').getValue();
    const phone = 3039291447;
    const client_id = 14597060;
  
    const params = {
    "headers": {
      'X-Web-Key': xWebKey,
      'X-Access-Token': xAccessToken
      },
    "method": 'POST',
    "muteHttpExceptions" : true
    }
  
    var api_call = 'https://api.clienttether.com/v2/api/update_client_by_id?'
    var url = api_call.concat(url)
    var post = UrlFetchApp.fetch(url, params);
    var response = post.getResponseCode();
    if (response != 200){
      return 'Update Failed'
    }
    return response