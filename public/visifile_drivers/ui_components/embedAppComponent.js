function component( args ) {
/*
base_component_id("embed_app_component")
component_type("SYSTEM")
load_once_from_file(true)
*/

    Vue.component("embed_app_component", {
      data: function () {
        return {
            text:                args.text,
            baseComponentId:     null,
            app_component_name:  null,
            embed_code: ""
        }
      },
      template:
`<div style='background-color:white; ' >
    <div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);background-color: lightgray; padding: 5px;padding-left: 15px;border: 4px solid lightgray;' >

        <slot style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);display: inline-block;' v-if='text' :text2="text">
        </slot>
    </div>

    <div style='border-radius: 5px;margin-left:15px;margin-top:15px;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);border: 4px solid lightgray; '>
        <div    style='font-size:14px;font-weight:bold;border-radius: 0px;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);background-image: linear-gradient(to right,  #000099, lightblue); color: white; border: 0px solid lightgray; padding:4px; margin:0;padding-left:14px;'>

            App Embed

        </div>

        <div style="padding:10px; overflow:scroll;height:65vh;">

            <div style="height:100%;">

              <div>
                <div>
                  <h2  class='caption' style='display: inline-block;'>Embedding {{app_component_name}} </h2>
                </div>
                <div  v-if="!baseComponentId">
                  A component must be selected to embed

                </div>

                <div v-if="baseComponentId">
                  Copy and paste the following code into your webpage to embed this widget:

                  <br><br>

                  <code>
                    &lt;iframe width="600"
                    height="500"
                    src="{{embed_code}}"
                    scrolling="no"
                    marginheight="0"
                    marginwidth="0"&gt;&lt;/iframe&gt;
                  </code>

                  <br><br>
                  <br><br>


                  Or directly link to the app with:

                  <br><br>
                  <a v-bind:href='embed_code'>{{embed_code}}</a>

                  
                </div>
              </div>
 
            </div>

        </div>

  
</div>`
     ,

     mounted: async function() {
         let mm = this
         let thisVueInstance  = this
         args.text            = null
         this.baseComponentId = yz.getValueOfCodeString(thisVueInstance.text, "base_component_id")

         if (isValidObject(thisVueInstance.text)) {
             this.read_only = yz.getValueOfCodeString(thisVueInstance.text, "read_only")
         }


         if (mm.baseComponentId) {
             let sql =    "select  component_name as name from  released_components  where " +
                 "        base_component_id = '" + mm.base_component_id + "'"

             //alert( sql )

             let results = await callComponent(
                 {
                     base_component_id:    "readFromInternalSqliteDatabase"
                 }
                 ,
                 {
                     sql: sql
                 })


             if (results) {
                 //alert(JSON.stringify(results,null,2))
                 if (results.length > 0) {

                     mm.app_component_name = results[0].name
                 }
             }




             mm.embed_code = "http://" + location.hostname + ":" + location.port + "/app/" + mm.baseComponentId + ".html"
         }
     }
     ,
     methods: {

         getText: async function () {
             if (!isValidObject(this.text)) {
                 return null
             }

             return this.text
         }
         ,

         setText: function (textValue) {
             let thisVueInstance = this
             this.text = textValue

             if (!isValidObject(this.text)) {
                 return
             }


         }

     }
    })

}
