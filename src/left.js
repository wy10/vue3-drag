// export const leftData = {
//     "trade-table": {
//       title: "表格",
//       compName: "trade-table",
//       preview: () => {
//         return "表格";
//       },
//       compData:[
//         {
//           title:'标题',
//           eleName:'el-input',
//           value:'表格交易数据'
//         }
//       ]
//     },
//      "trade-echart": {
//       title: "图表",
//       compName: "trade-echart",
//       preview: () => {
//         return "图表";
//       },
//       compData:[
//         {
//           title:'标题',
//           eleName:'el-input',
//           value:'图表交易数据'
//         }
//       ]
//     },
//   }

export const leftData = [
    {
        title: 'table',
        compName: 'trade-table',
        type: 'table',
        preview: () => {
            return '表格'
        },
        props: {
            title: {
                type: 'string',
                require: true,
                order: '1',
                configComType: 'el-input',
                value: '表格',
            },
            rows: {
                type: 'number',
                value: 30,
            },
        },
    },
    {
        title: 'ECharts',
        compName: 'trade-echart',
        type: 'echart',
        preview: () => {
            return '图表'
        },
        props: {
            title: {
                type: 'string',
                require: true,
                order: '1',
                configComType: 'el-input',
                value: '图表',
            },
        },
    },
]

// const canvas = [
//   {
//     "id":1,
//     "top":0,
//     "left":0,
//     "zIndex":1,
//     "compName":"trade-table",
//     "width":800,
//     "height":800,
//     "talbeTitle":"111111",
//     "date":'',
//     componentData:{
//       title: "表格",
//       compName: "trade-table",
//       preview: () => {
//         return "表格";
//       },
//       // compData:[
//       //   {
//       //     title:'标题',
//       //     eleName:'el-input',
//       //     value:'表格交易数据',
//       //   }
//       // ],
//       props:{
//         tableTitle:{
//           type:'string',
//           require:true,
//           order:'1',
//           configComType:'el-input'
//         },
//         date:{
//           type:'date',
//           require:true,
//           order:'2',
//            configComType:'el-date'
//         }
//       },

//     }
//   }
// ]

// {
//     "id": 1,
//     "compName": "trade-table",
//     "translateX": 0,
//     "translateY": 0,
//     "width": 1,
//     "height": 0.5,
//     "compData": {}
// },
// {
//     "id": 2,
//     "compName": "trade-echart",
//     "translateX": 0,
//     "translateY": 0,
//     "width": 0.5,
//     "height": 0.25,
//     "compData": {
//         "type": "echart"
//     }
// },
// {
//     "id": 4,
//     "compName": "trade-table",
//     "translateX": 0,
//     "translateY": 0,
//     "width": 0.5,
//     "height": 0.25,
//     "compData": {}
// },
// {
//     "id": 3,
//     "compName": "trade-echart",
//     "translateX": 0.5,
//     "translateY": -0.5,
//     "width": 0.5,
//     "height": 0.5,
//     "compData": {
//         "type": "echart"
//     }
// }

const right = [
    {
        name: 'tableTitle',
        type: 'string',
        require: true,
        configComType: 'el-input',
        value: '1111111111',
    },
    {
        name: 'date',
        type: 'date',
        require: true,
        configComType: 'el-date',
    },
]
