import * as THREE from 'three'
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

export default function usePointer(sizes) {
    // 使用 ref 和 reactive 管理狀態
    const pointerMoved = ref(false)
    const coords = reactive(new THREE.Vector2())
    const prevCoords = reactive(new THREE.Vector2())
    const diff = reactive(new THREE.Vector2())
    let timer = null

    const setCoords = (x, y) => {
        if (timer) clearTimeout(timer)

        const coordsX = (x / sizes.width) * 2 - 1
        const coordsY = -(y / sizes.height) * 2 + 1
        coords.x = coordsX
        coords.y = coordsY

        pointerMoved.value = true

        timer = setTimeout(() => {
            pointerMoved.value = false
        }, 100)
    }

    const onPointerMove = (e) => {
        if (e.pointerType == 'touch' && e.isPrimary) {
            setCoords(e.pageX, e.pageY)
        } else {
            setCoords(e.clientX, e.clientY)
        }
    }

    /**
     * 觸控輸入處理
     */
    const onPointerDown = (e) => {
        if (e.pointerType !== 'touch' || !e.isPrimary) return

        setCoords(e.pageX, e.pageY)
    }

    /**
     * 更新指針座標差異
     */
    const update = () => {
        diff.subVectors(coords, prevCoords)
        prevCoords.copy(coords)
    }

    /**
     * 初始化事件監聽器
     */
    const init = () => {
        document.body.addEventListener('pointermove', onPointerMove, false)
        document.body.addEventListener('pointerdown', onPointerDown, false)
    }

    /**
     * 清理事件監聽器
     */
    const cleanup = () => {
        document.body.removeEventListener('pointermove', onPointerMove)
        document.body.removeEventListener('pointerdown', onPointerDown)
        if (timer) clearTimeout(timer)
    }

    // 立即初始化事件監聽器，不等待 onMounted
    init()

    // 在組件卸載前清理
    onBeforeUnmount(() => {
        cleanup()
    })

    // 返回需要暴露的狀態和方法
    return {
        pointerMoved,
        coords,
        diff,
        update,
        setCoords
    }
}
