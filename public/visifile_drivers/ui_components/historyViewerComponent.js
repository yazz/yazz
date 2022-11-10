function component( args ) {
/*
base_component_id("history_viewer_component")
component_type("SYSTEM")
load_once_from_file(true)
*/

    let editorDomId     = uuidv4()
    let editor          = null


    Vue.component("history_viewer_component", {
      data: function () {
        return {
            text:           args.text
            ,
            firstCommitTimestamps: {}
            ,
            selectedCommit: null
            ,


// list of commits. Eg:
//        [  {codeSha: "fdsfsddfsfsdfds", timestamp: new Date().getTime()},    ]
            commitsV1: [
            ]
            ,



            currentCommithashId: null
            ,
            baseComponentId: null
        }
      },
      template: `<div style='background-color:white; ' >

                      <div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);background-color: lightgray; padding: 5px;padding-left: 15px;border: 4px solid lightgray;' >
                        <slot style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);display: inline-block;' v-if='text' :text2="text">
                        </slot>
                      </div>

                      <div style='border-radius: 5px;margin-left:15px;margin-top:15px;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);border: 4px solid lightgray;padding:5px; '>
                        <div    style='font-size:14px;font-weight:bold;border-radius: 0px;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);background-image: linear-gradient(to right,  #000099, lightblue); color: white; border: 0px solid lightgray; padding:4px; margin:0;padding-left:14px;'>

                          Component History
                        </div>
                        
                        
                        <div><b>Current commit ID:</b> {{currentCommithashId}}</div>
                        
                        
                        <div>
                          <b>Previous commits:</b>  
                        </div>
                        
                      
                      
                      <div style="overflow: scroll;height:40vh">
                        <li v-for='commit in commitsV1'
                            style='color:black;'>
                          {{msToTime(commit.timestamp,{shortOnly: true})}} - {{commit.numChanges}}
                          <span v-if="(commit.numChanges > -1) && (selectedCommit != commit.codeSha)">
                            <a href='#' v-on:click='selectedCommit = commit.codeSha'>More</a>
                          </span>
                          <span v-if="(commit.numChanges > -1) && (selectedCommit == commit.codeSha)">
                            <a href='#' v-on:click='selectedCommit = null'>Less</a>
                          </span>
                          <div v-if="selectedCommit == commit.codeSha" style="background-color: lightgray;padding: 10px;">
                                <br/>
                                <div><b>Time:</b> {{msToTime(commit.timestamp,{timeOnly: true})}} </div>
                                <div><b>Commit ID:</b> {{commit.codeSha}} </div>
                                <div><b>Type:</b> {{commit.baseComponentId}} </div>
                                <div><b>User:</b> {{commit.userId}} </div>
                                <br/>
                                <div v-if="commit.changes">
                                    <div
                                        v-for="(item,i) in commit.changes.slice().reverse()">
                                        <span v-if="i==(commit.changes.length - 1)"><b>First commit</b> - </span>
                                        <span v-if="i!=(commit.changes.length - 1)"><b>{{ capitalizeFirstLetter(timeDiffLater(firstCommitTimestamps[commit.codeSha], item.timestamp)) }}</b> - </span>
                                       
                                      {{ item.code_change_text }}
                                    </div>
                              </div>
                          </div>


                        </li>
                      </div>
                  </div>
                  
             </div>`
     ,

     mounted: async function() {
     },
     methods: {


        // -----------------------------------------------------
        //                      getText
        //
        // This is called to get the SQL definitions
        //
        //
        //
        // -----------------------------------------------------
        getText: async function() {
            if (!isValidObject(this.text)) {
                return null
            }

            return this.text
        }
        ,


        getCurrentCommitId: async function() {
        //debugger
            let mm = this
            let retVal = null
            let openfileurl = "http" + (($HOSTPORT == 443)?"s":"") + "://" + $HOST + "/get_commit_hash_id"
            let promise = new Promise(async function(returnfn) {
                fetch(openfileurl, {
                    method: 'post',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: JSON.stringify({text: mm.text})
                })
                    .then((response) => response.json())
                    .then(function (responseJson) {
                        returnfn( responseJson.ipfsHash )
                    })
                    .catch(err => {
                        //error block
                        returnfn(null)
                    })
            })
            retval = await promise
            return retval
        }
        ,





        getHistory: async function() {
        debugger
            let mm = this
            //zzz
            let openfileurl = "http" + (($HOSTPORT == 443)?"s":"") + "://" + $HOST + "/get_version_history_v2?" +
                new URLSearchParams({
                        id: mm.baseComponentId,
                        commit_id: mm.currentCommithashId
                })
            fetch(openfileurl, {
                method: 'get',
                credentials: "include"
            })
                .then((response) => response.json())
                .then(function(responseJson)
                {
                    //debugger
                    for (let rt=0;rt<responseJson.length; rt++) {

                        mm.commitsV1.push(
                            {
                                codeSha: responseJson[rt].id,
                                timestamp: responseJson[rt].creation_timestamp,
                                numChanges: responseJson[rt].num_changes,
                                changes: responseJson[rt].changes,
                                userId: responseJson[rt].user_id,
                                baseComponentId: responseJson[rt].base_component_id
                            })


                        if (responseJson[rt].changes && responseJson[rt].changes.length > 0) {
                            mm.firstCommitTimestamps[responseJson[rt].id] = responseJson[rt].changes[0].timestamp
                        }

                    }


                })
                .catch(err => {
                    //error block
                })
        }
        ,

        // -----------------------------------------------------
        //                      setText
        //
        // This is called to set the SQL
        //
        //
        //
        // -----------------------------------------------------
        setText: async function(textValue) {
            this.text           =  textValue
            this.baseComponentId = saveHelper.getValueOfCodeString(this.text,"base_component_id")

            debugger
            this.currentCommithashId = await this.getCurrentCommitId()
            await this.getHistory()

            if (!isValidObject(this.text)) {
                return
            }

        }

     }


    })

}
