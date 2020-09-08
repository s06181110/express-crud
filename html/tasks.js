axios.defaults.baseURL = 'http://localhost:30000';
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

Vue.component('tasks', {
    data: function() {
        return {
            todos: []
        }
    },
    created: function () {
        this.fetchTasks()
    },
    methods: {
        fetchTasks: function() {
            axios.get('http://localhost:30000/todos').then(res => {
                this.todos = res
                console.log(res)
            })
        }
    },
    template: '<p>hoge</p>'
})