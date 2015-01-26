from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def hello_world():
    return '{name} says hello to {person}'.format(name='Bob', person='Jane') if 3 > 2 else 'Three is not greater than 2 '

@app.route('/hi')
def hi():
    return render_template('index.html')

@app.route('/yo')
def yo_world():
    return 'Yo World'

if __name__ == '__main__':
    app.run(debug=True)
