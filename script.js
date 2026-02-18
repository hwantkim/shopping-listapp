// 2026-02-18 14:30:00 Created by Gemini CLI

document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.getElementById('itemInput');
    const addBtn = document.getElementById('addBtn');
    const shoppingList = document.getElementById('shoppingList');
    const clearBtn = document.getElementById('clearBtn');

    // 로컬 스토리지에서 데이터 불러오기
    let items = JSON.parse(localStorage.getItem('shoppingListItems')) || [];

    // 초기 렌더링
    renderItems();

    // 아이템 추가 기능
    function addItem() {
        const text = itemInput.value.trim();
        if (text === '') return;

        const newItem = {
            id: Date.now(),
            text: text,
            completed: false
        };

        items.push(newItem);
        saveAndRender();
        itemInput.value = '';
        itemInput.focus();
    }

    // 아이템 삭제 기능
    function deleteItem(id) {
        items = items.filter(item => item.id !== id);
        saveAndRender();
    }

    // 아이템 체크 토글 기능
    function toggleComplete(id) {
        items = items.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        saveAndRender();
    }

    // 화면 렌더링 및 저장
    function saveAndRender() {
        localStorage.setItem('shoppingListItems', JSON.stringify(items));
        renderItems();
    }

    function renderItems() {
        shoppingList.innerHTML = '';
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = item.completed ? 'completed' : '';
            li.dataset.id = item.id;

            // 아이콘 생성
            const icon = document.createElement('i');
            icon.className = `far ${item.completed ? 'fa-check-circle' : 'fa-circle'}`;
            
            // 텍스트 스팬 생성 (보안을 위해 textContent 사용)
            const span = document.createElement('span');
            span.textContent = item.text;

            // 삭제 버튼 생성
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.title = '삭제';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; // 아이콘은 정적 HTML이므로 안전

            li.appendChild(icon);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            shoppingList.appendChild(li);
        });
    }

    // 이벤트 위임: 리스트(ul)에 하나의 리스너만 등록하여 성능 최적화
    shoppingList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const id = Number(li.dataset.id);

        // 삭제 버튼 클릭 확인
        if (e.target.closest('.delete-btn')) {
            deleteItem(id);
        } else {
            // 그 외 영역 클릭 시 완료 상태 토글
            toggleComplete(id);
        }
    });

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', addItem);
    
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('모든 항목을 삭제하시겠습니까?')) {
            items = [];
            saveAndRender();
        }
    });
});
