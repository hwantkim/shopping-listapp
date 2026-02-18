// 2026-02-18 14:30:00 Created by Gemini CLI
// 2026-02-18 14:45:00 Updated for Supabase Integration

const SUPABASE_URL = 'https://zxadtuqwgpucyrnktzmt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YWR0dXF3Z3B1Y3lybmt0em10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTE4MTIsImV4cCI6MjA4Njk4NzgxMn0.3NcQKw_bn_eMRr7NG9JkdcvXDXM4POlhn61NEJoADF8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.getElementById('itemInput');
    const addBtn = document.getElementById('addBtn');
    const shoppingList = document.getElementById('shoppingList');
    const clearBtn = document.getElementById('clearBtn');

    let items = [];

    // 초기 데이터 로드
    fetchItems();

    // 데이터 가져오기 (Supabase)
    async function fetchItems() {
        const { data, error } = await supabaseClient
            .from('shopping_items')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching items:', error);
            return;
        }

        items = data;
        renderItems();
    }

    // 아이템 추가 기능 (Supabase)
    async function addItem() {
        const text = itemInput.value.trim();
        if (text === '') return;

        const { data, error } = await supabaseClient
            .from('shopping_items')
            .insert([{ text: text, completed: false }])
            .select();

        if (error) {
            console.error('Error adding item:', error);
            alert('아이템 추가에 실패했습니다.');
            return;
        }

        if (data && data.length > 0) {
            items.push(data[0]);
            renderItems();
            itemInput.value = '';
            itemInput.focus();
        }
    }

    // 아이템 삭제 기능 (Supabase)
    async function deleteItem(id) {
        const { error } = await supabaseClient
            .from('shopping_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting item:', error);
            alert('삭제에 실패했습니다.');
            return;
        }

        items = items.filter(item => item.id !== id);
        renderItems();
    }

    // 아이템 체크 토글 기능 (Supabase)
    async function toggleComplete(id, currentStatus) {
        const { error } = await supabaseClient
            .from('shopping_items')
            .update({ completed: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating item:', error);
            alert('상태 변경에 실패했습니다.');
            return;
        }

        items = items.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        renderItems();
    }

    // 전체 삭제 기능 (Supabase)
    async function clearAllItems() {
        // 모든 항목 삭제: id가 0보다 큰 모든 항목을 삭제한다고 가정 (또는 다른 조건 사용)
        // 주의: delete() without filter is not allowed by default in Supabase client libraries unless explicitly allowed by policy?
        // Actually, without a WHERE clause, delete() throws an error to prevent accidental deletion of all rows.
        // We need to use a condition that is always true for our rows. 'id.gt.0' works if IDs are positive.
        
        if (!confirm('정말로 모든 항목을 삭제하시겠습니까?')) return;

        const { error } = await supabaseClient
            .from('shopping_items')
            .delete()
            .gt('id', 0); 

        if (error) {
            console.error('Error clearing items:', error);
            alert('전체 삭제에 실패했습니다.');
            return;
        }

        items = [];
        renderItems();
    }

    function renderItems() {
        shoppingList.innerHTML = '';
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = item.completed ? 'completed' : '';
            li.dataset.id = item.id;
            li.dataset.completed = item.completed; // 상태 저장을 위해 데이터 속성 추가

            // 아이콘 생성
            const icon = document.createElement('i');
            icon.className = `far ${item.completed ? 'fa-check-circle' : 'fa-circle'}`;
            
            // 텍스트 스팬 생성
            const span = document.createElement('span');
            span.textContent = item.text;

            // 삭제 버튼 생성
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.title = '삭제';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

            li.appendChild(icon);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            shoppingList.appendChild(li);
        });
    }

    // 이벤트 위임
    shoppingList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const id = Number(li.dataset.id);
        const isCompleted = li.dataset.completed === 'true';

        // 삭제 버튼 클릭 확인
        if (e.target.closest('.delete-btn')) {
            deleteItem(id);
        } else {
            // 그 외 영역 클릭 시 완료 상태 토글
            toggleComplete(id, isCompleted);
        }
    });

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', addItem);
    
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    clearBtn.addEventListener('click', clearAllItems);
});
