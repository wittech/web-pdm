
import { Button, Icon, Modal, Popover, Radio, Select, Switch, Tooltip } from 'antd'
const RadioGroup = Radio.Group
import classNames from 'classnames'
import { useDispatch, useSelector } from 'dva'
import React, { useCallback, useEffect, useRef, useState } from 'react' // import { exitFullscreen, launchIntoFullscreen } from './../util'
import intl from './../util/intel'
const confirm = Modal.confirm
const { Option } = Select
const zoomInClick = ({ toolBarCommand, update}) =>  { toolBarCommand && toolBarCommand('max-zoom'); update(+new Date())}
const zoomOutClick = ({toolBarCommand, update}) => { toolBarCommand && toolBarCommand('min-zoom'); update(+new Date()) }





const changeTwoDecimal_f = (x) => {
　　let f_x = parseFloat(x)
　　if (isNaN(f_x)) {
　　　　return 0
　　}
  f_x = Math.round(x * 100) / 100
　　let s_x = f_x.toString()
　　let pos_decimal = s_x.indexOf('.')
　　if (pos_decimal < 0) {
　　　　pos_decimal = s_x.length
　　  s_x += '.'
　　}
　　while (s_x.length <= pos_decimal + 2) {
　　　　s_x += '0'
　　}
　　return s_x
}
const BaseCommandList: any[] = [
//     {/ /     title: '1:1',
//   k e y: '1to1',，
//   icon: 'column',
//     click: (toolBarCommand, graph, update) => {
//     const width = graph.get('width')
//     const height = graph.get('height')
//     graph.zoomTo(1, {
//       x: width / 2,
//       y: height / 2,
//     })
//     graph.paint()
//     const zoom = graph.getZoom()
//     graph.findAll('node', (node) => true).map((node) => {
//       graph.updateItem(node, {
//         isKeySharp: zoom < 0.4,
//       })
//     })
//     update(+new Date())
//   },
// },

{
  title: intl.get('全景').d('全景'),
  key: 'full',
  icon: 'container',
  click: (toolBarCommand, graph, update) => {

    graph.getNodes().filter((a) => !a.isSys).forEach((node) => {
      node.getContainer().show()
    })
    graph.fitView(0)
    // setImmediate(() => {
    //   alert()
    //   graph.fitView(0)
    //   graph.paint()
    //   }, 2000)
    // graph.paint()
    const zoom = graph.getZoom()
    graph.findAll('node', (node) => true).map((node) => {
      graph.updateItem(node, {
        isKeySharp: zoom < 0.4,
        isCardSharp: zoom <= 0.5,
      })
    })

    // toolBarCommand && toolBarCommand('keySharp', { isKeysharp: true})
    update(+new Date())
  },
}, {
  title: intl.get('上').d('上'),
  key: 'up',
  icon: 'arrow-up',
  click: (_, graph) => {
    graph.translate(0, -100)
    graph.paint()
  },
}, {
  title: intl.get('下').d('下'),
  key: 'down',
  icon: 'arrow-down',
  click: (_, graph) => {
    graph.translate(0, 100)
    graph.paint()
  },
}, {
  title: intl.get('左').d('左'),
  key: 'left',
  icon: 'arrow-left',
  click: (_, graph) => {
    graph.translate(-100, 0)
    graph.paint()
  },
}, {
  title: intl.get('右').d('右'),
  key: 'right',
  icon: 'arrow-right',
  click: (_, graph) => {
    graph.translate(100, 0)
    graph.paint()
  },
},
//  {
//   title: intl.get('保存位置').d('保存位置'),
//   key: 'save-position',
//   icon: 'upload',
//   click: (toolBarCommand) => {
//     toolBarCommand && toolBarCommand('upload')
//   },
// },

{
  title: intl.get('重新排列').d('重新排列'),
  key: 'resetLayout',
  icon: 'retweet',
  click: (toolBarCommand) => {
    confirm({
      title: '重新排列',
      content: '重新排列后，模型的位置重新排列 ？',
      onOk() {
        toolBarCommand && toolBarCommand('resetLayout') // toolBarCommand && toolBarCommand('keySharp', { isKeysharp: false})
      },
      onCancel() {
        console.log('Cancel')
      },
    })

  },

},
// {
//   title: intl.get('上一步').d('上一步'),
//   key: 'last',
//   icon: 'back',
//   click: (toolBarCommand) => {
//     alert('目前不可用')
//     // toolBarCommand && toolBarCommand('resetLayout')
//     // toolBarCommand && toolBarCommand('keySharp', { isKeysharp: false})
//   },

// },
// {
//   title: intl.get('下一步').d('下一步'),
//   key: 'next',
//   icon: 'forward',
//   click: (toolBarCommand) => {
//     alert('目前不可用')
//     // toolBarCommand && toolBarCommand('resetLayout')
//     // toolBarCommand && toolBarCommand('keySharp', { isKeysharp: false})
//   },

// },
//  {
//   title: intl.get('新增模型').d('新增模型'),
//   icon: 'plus',
//   click: (toolBarCommand) => {
//     toolBarCommand && toolBarCommand('insertModel')
//   },
// }
]
const DataCommandList = [
  {
    title: intl.get('保存').d('保存'),
    icon: 'sort',
    click: (toolBarCommand) => {
      toolBarCommand && toolBarCommand('save') // toolBarCommand && toolBarCommand('keySharp', { isKeysharp: false})
    },
  },
  {
  title: intl.get('编辑模型').d('编辑模型'),
  icon: 'edit',
  data: true,
  click: (toolBarCommand) => {
    toolBarCommand && toolBarCommand('editModel')
  },
}, {
  title: intl.get('模型中心').d('模型中心'),
  icon: 'monitor',
  data: true,
  click: (toolBarCommand) => {
    toolBarCommand && toolBarCommand('centerModel') // toolBarCommand && toolBarCommand('keySharp', { isKeysharp: false})
  },
}]
export default (({
  graph,
  zoom,
  toolBarCommand,
  currentModel,
  saveFun,
  toolBarCommands,
  namespace,
  setUpdateId,
}) => {
  const [_, update] = useState(null)
  // tslint:disable-next-line: radix
  const zoomNum = graph && changeTwoDecimal_f(parseFloat(graph.getZoom() * 100 / 2) + '') || 0
  const dispatch = useDispatch()

  const { isArrangeLayout } = useSelector((s) => s[namespace])
  const arrangeLayout = useCallback(() => {
    dispatch({
      type: `${namespace}/setArrangeLayout`,
      isArrangeLayout: !isArrangeLayout,
    })
  }, [isArrangeLayout])

  const zoomChange = useCallback((e) => {
    const newZoom = e.target.value
    graph.getNodes().filter((a) => !a.isSys).forEach((node) => {
      node.getContainer().show()
    })
    const gwidth = graph.get('width')
    const gheight = graph.get('height')
    const point = graph.getCanvasByPoint(gwidth / 2, gheight / 2)
    // graph.moveTo({x: point.x , y : point.y})
    graph.zoomTo(newZoom / 100, {x: point.x , y : point.y})
    graph.paint()
    setUpdateId(+new Date())
    update(+new Date())
    // graph.zoomTo(newZoom / 100)
    // alert(newZoom)

  } , [graph])

  // alert(graph && graph.getZoom())
  return (
  <div className='console-erd-toolbar'>
    <div className='right'>
    <Tooltip title={!isArrangeLayout ? intl.get('模型字段关联').d('模型字段关联') : intl.get('聚合关联').d('聚合关联') } >
      <span className='command-btn zoomleft'  >
        <Switch checkedChildren='聚合' unCheckedChildren='字段' size='small' onChange={arrangeLayout} checked={isArrangeLayout} />
        </span>
        </Tooltip>
    <Tooltip title={intl.get('放大').d('放大')} ><span className='command-btn zoomleft' onClick={zoomInClick.bind(this, { toolBarCommand, graph, update })} ><Icon type='zoom-in' /></span></Tooltip>
    <span className='zoomNum noselect'>
    <Popover footer={false} content={<RadioGroup value={zoomNum * 2} onChange={zoomChange} >
        <Radio value={200}>100%</Radio>
        <Radio value={100}>50%</Radio>
        <Radio value={20}>10%</Radio>
      </RadioGroup>} placement='bottom' >
      {graph && `${zoomNum}%` }
      </Popover>
      </span>
    <Tooltip title={intl.get('缩小').d('缩小')} ><span className='command-btn' onClick={zoomOutClick.bind(this, { toolBarCommand, graph, update })}><Icon type='zoom-out' /></span></Tooltip>

   {
     BaseCommandList.filter((c) => !c.data || currentModel).filter((c) => c.title !== intl.get('保存').d('保存') || saveFun).map((command) => {
      return (
      <RenderPopConfirm title={command.title} isConfirm={command.isConfirm} key={command.key} btnRender={<Tooltip title={command.title} ><span className={classNames(['command-btn', {
        'command-btn-data': !!command.data,
      }])} onClick={command.click.bind(this, toolBarCommand, graph, update)}><Icon type={command.icon} /></span></Tooltip>}  />)
    })
    }

    </div>
    <div className='right'>
   {/* {
     DataCommandList.concat(toolBarCommands ? toolBarCommands : []).filter((c) => !c.data || currentModel).filter((c) => c.title !== intl.get('保存').d('保存') || saveFun).map((command) => {
        return (
        <RenderPopConfirm click={command.click.bind(this, toolBarCommand, graph, update)} title={command.title} isConfirm={command.isConfirm} key={command.key} btnRender={<Tooltip title={command.title} ><Button type='text' icon={command.icon} className={classNames(['command-btn', {
          'command-btn-data': !!command.data,
        }])} onClick={!command.isConfirm && command.click.bind(this, toolBarCommand, graph, update)}/></Tooltip>}  />)
    })
    } */}
</div>
    </div>)
})

const toNumString = (str) => {

}

const RenderPopConfirm = ({isConfirm = false , btnRender, title, click}) => {
   if (isConfirm) {
      return (<Popover title={$$(`确定是否${title}？`)} okText={$$('是')} cancelText={$$('否')} onOk={click}>
       {btnRender}
      </Popover>
      )
   } else {
     return btnRender
   }
}

const $$ = (txt) => intl.get(txt).d(txt)
