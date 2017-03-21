require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片文件json数据
let imageDataArr = require('../data/imageDatas.json');

//设置图片url
var imageDatas =  (function (imageDataArr){
  for (let i = 0 ; i < imageDataArr.length ; i++){
      let imageData = imageDataArr[i];
      let imageURL = '../images/'+imageData.fileName;
      imageData.URL = imageURL;
      imageDataArr[i] = imageData;
  }
  return imageDataArr;
})(imageDataArr);

/**
 * 获取范围内的随机值
 */
function getRangeRandom (floor,upper){
  let randomValue  =  Math.ceil(Math.random() * ( upper - floor) + floor);
  return randomValue;
}

//主组件
class AppComponent extends React.Component {
  Constant =  {
  //中心图片取值
  centerPos:{
    left : 0,
    top : 0
  },
  //水平方向取值范围
  hPosRange:{
    leftSecX : [0,0], //左侧x范围
    rightSecX : [0,0], //右侧x范围
    y : [0,0], //y范围 左右相同
  },
  //竖直方向取值范围
  vPosRange:{
    x : [0,0],
    topY : [0,0]
  }
};
  constructor(props) {
    super(props);
    this.state = {
      imgArr:[
        /*{
         pos: {
         left: '0',
         top: '0'
         },
         rotate: 0,    // 旋转角度
         isInverse: false,    // 图片正反面
         isCenter: false,    // 图片是否居中
         }*/
      ]
    };
  }



  /**
   * 重新排列图片位置
   * @param centerIndex 居中图片下标
   */
  rearrange(centerIndex) {

    //获取图片信息数组
    let imgArr = this.state.imgArr;

    //设置中间位置的图片信息
    let centerImg = imgArr.splice(centerIndex, 1);
    centerImg[0].pos = this.Constant.centerPos;

    //设置顶部图片的位置信息
    let topImgNum = Math.ceil(Math.random() ), //顶部图片数量 <= 1
      topImgIndex = Math.ceil(Math.random() * (imgArr.length - topImgNum)), //顶部图片的下标
      topImg = imgArr.splice(topImgIndex, topImgNum);
    //如果有顶部图片
    if (topImg) {
      topImg[0].pos = {
        top: getRangeRandom(this.Constant.vPosRange.topY[0], this.Constant.vPosRange.topY[1]),
        left: getRangeRandom(this.Constant.vPosRange.x[0], this.Constant.vPosRange.x[1])
      };
    }

    //设置左右两边图片
    for (let i = 0, k = imgArr.length / 2; i < imgArr.length; i++) {
      let hPosRangeLOR = null;
      //数组左半边数据放置在左半区 ,右半边数组放置在右半区
      if (i < k) {
        hPosRangeLOR = this.Constant.hPosRange.leftSecX;
      } else {
        hPosRangeLOR = this.Constant.hPosRange.rightSecX;
      }
      imgArr[i].pos = {
        top: getRangeRandom(this.Constant.hPosRange.y[0], this.Constant.hPosRange.y[1]),
        left: getRangeRandom(hPosRangeLOR[0], hPosRangeLOR[1])
      }
    }

    //--------start 合并数据信息-------------
    imgArr.splice(centerIndex, 0, centerImg[0]);
    //有顶部图片时合并
    if (topImg) {
      imgArr.splice(topImgIndex, 0, topImg[0]);
    }
    //---------end 合并数据信息
    this.setState({imgArr: imgArr});
  }

  /**
   * 渲染组件前 计算每个组件position的取值范围
   */
  componentDidMount(){

      //获取舞台的大小

      let stageDom = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDom.scrollWidth,
        stageH = stageDom.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

      //获取imgFigure组件的大小
      let imgFigure = ReactDOM.findDOMNode(this.refs.imageFigure0),
        imgW = imgFigure.scrollWidth,
        imgH = imgFigure.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

      //计算中心Constant值
      this.Constant.centerPos = {
        left : halfStageW - halfImgW,
        top : halfStageH - halfImgH
      };

      //计算水平方向Constant值
      this.Constant.hPosRange = {
        leftSecX : [0 - halfImgW , halfStageW - halfImgW * 3 ],
        rightSecX : [halfStageW + halfImgW , stageW - halfImgW],
        y : [0 - halfImgH , stageH - halfImgH]
      };

      //计算垂直方向Constant值
    this.Constant.vPosRange = {
        x : [halfStageW - imgW , halfStageW ],
        topY : [0 - halfImgH , halfStageH -  halfImgH * 3]
    };

    this.rearrange(0);
  }
  render() {
    var controllerUnits = [],
      imgFigures = [];
    imageDatas.forEach((value,index)=> {
      if (!this.state.imgArr[index]){
        this.state.imgArr[index] = {
          pos: {
            left: 0,
            top: 0
          }
        };
      }
      imgFigures.push(<ImgFigure data={value}  key={index} ref={'imageFigure' + index} arrange={this.state.imgArr[index]} />);
    });
    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
           {controllerUnits}
        </nav>
      </section>
    );
  }
}

class ImgFigure  extends  React.Component{

  render(){
    let styleObj = {};
    // 如果props属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }
    return (
      <figure className="img-figure" style={styleObj}>
        <img src={this.props.data.URL}
              alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
      </figure>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
