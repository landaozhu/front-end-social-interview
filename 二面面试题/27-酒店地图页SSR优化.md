# 携程酒店地图页 SSR 优化？4s 到 2s

## 30 秒版

Trip.com 海外酒店**地图列表页**，React+TS+Redux **SSR**。负责 Google Map/Mapbox 图层、酒店定位。瓶颈是地图资源重 + 价格/列表 waterfall。手段：**SSR 预取**、**Java BFF 批量请求**减少往返。首屏 **4s→2s**，Lighthouse 验证。

## 2 分钟版

**S**：国际化酒店搜索核心页，地图+价格+列表需同屏  
**T**：负责人，地图和价格模块  
**A**：  
1. SSR 输出首屏酒店和价格数据  
2. 地图组件客户端 hydrate 后 init（Google Map 依赖 window）  
3. BFF 聚合接口，避免前端串行  
4. 地图图层与定位模块化便于迭代  

**R**：首屏减半；具备 Java BFF 联调能力  

**质量**  
- Jest 单测  
- 测试/堡垒/线上多环境 + CR  

**SSR 坑**  
- 服务端无 window → dynamic import 地图  
-  hydration 不一致 → 保证同构数据  

## 素材来源：简历酒店地图页四条
