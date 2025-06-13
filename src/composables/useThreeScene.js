import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { onBeforeUnmount, ref } from 'vue'
import fragmentShader from '../shaders/fragment.glsl?raw'
import vertexShader from '../shaders/vertex.glsl?raw'
import usePointer from './usePointer'

export default function useThreeScenes(webglRef) {
    const scene = new THREE.Scene()
    let renderer, camera, controls, box, clock
    let animationFrameId = null
    const webgl = ref(webglRef)

    scene.background = new THREE.Color('#99a1af')

    // Resize
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
    }

    // 使用指針 composable
    const { pointerMoved, coords, diff, update: updatePointer } = usePointer(sizes)

    const trailLength = 15
    const pointerTrail = Array.from({ length: trailLength }, () => new THREE.Vector2(0, 0))

    const uniforms = {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uPointerTrail: { value: pointerTrail },
        uMouse: { value: coords } // 直接使用 usePointer 的 coords
    }

    /**
     * 更新指針軌跡
     */
    const updatePointerTrail = () => {
        for (let i = trailLength - 1; i > 0; i--) {
            pointerTrail[i].copy(pointerTrail[i - 1])
        }
        pointerTrail[0].copy(coords)
    }

    /**
     * 處理視窗大小變化
     */
    const handleResize = () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        if (camera) {
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
        }

        // Update renderer
        if (renderer) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            renderer.setSize(sizes.width, sizes.height)
        }

        // Update uniforms
        uniforms.uResolution.value.set(sizes.width, sizes.height)
    }

    const initScene = () => {
        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputEncoding = THREE.sRGBEncoding

        // Camera
        camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 50)
        camera.position.set(0, 0, 10)
        camera.lookAt(0, 0, 0)
        scene.add(camera)

        // Mesh
        // 根據視窗比例計算平面尺寸
        const planeGeometry = new THREE.PlaneGeometry(2.0, 2.0)
        const planeMaterial = new THREE.RawShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            wireframe: false,
            uniforms: uniforms,
            color: new THREE.Color('#99a1af')
        })
        const plane = new THREE.Mesh(planeGeometry, planeMaterial)
        scene.add(plane)

        // 添加視窗大小變化事件監聽器
        window.addEventListener('resize', handleResize)

        // Controls
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enabled = true

        // Animate
        clock = new THREE.Clock()

        const tick = () => {
            const elapsedTime = clock.getElapsedTime()

            // 更新指針狀態
            updatePointer()

            // 更新指針軌跡
            updatePointerTrail()

            // 更新 uniform 值
            uniforms.uTime.value = elapsedTime

            controls.update()

            renderer.render(scene, camera)

            animationFrameId = window.requestAnimationFrame(tick)
        }

        webgl.value.appendChild(renderer.domElement)
        tick() // 啟動動畫循環
    }

    const cleanup = () => {
        // 取消動畫幀請求
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
        }

        // 移除事件監聽器
        window.removeEventListener('resize', handleResize)

        // 釋放幾何體和材質
        if (box) box.dispose()

        // 釋放渲染器資源
        if (renderer) {
            renderer.dispose()
            if (webgl.value && webgl.value.contains(renderer.domElement)) {
                webgl.value.removeChild(renderer.domElement)
            }
        }

        // 釋放控制器
        if (controls) controls.dispose()
    }

    onBeforeUnmount(cleanup)

    return {
        initScene,
        scene,
        renderer,
        camera,
        controls,
        sizes,
        webgl,
        pointerMoved,
        coords,
        diff
    }
}
