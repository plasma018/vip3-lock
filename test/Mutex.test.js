const uuid = require('uuid')
const supertest = require('supertest')
const {
    expect,
    assert
} = require('chai')

const api = supertest('http://localhost:8080/v1/mutex')

let handle;
let expiry;

before(function (done) {
    require('../index.js')
    done()
});

describe('Lock Mutex', function () {
    it('lock mutex', (done) => {
        api.put('/testkey').send({
            'ttl': 1
        }).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('handle');
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('locked');
            expect(res.body).to.have.property('expiry');
            handle = res.body.handle
            expiry = res.body.expiry
            done();
        })
    })

    it('lock mutex again until expiry', (done) => {
        setTimeout(function () {
            api.put('/testkey').expect(200).end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }
                assert(res.body.handle !== handle);
                handle = res.body.handle
                expiry = res.body.expiry
                done();
            })
        }, expiry * 1000 - Date.now())
    })

    it('lock mutex again immediately', (done) => {
        api.put('/testkey').expect(409).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('message');
            assert(res.body.message === 'lock in use');
            done();
        })
    })
});


describe('Query Mutex', function () {
    it('query mutex status', (done) => {
        api.get('/testkey').expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.not.have.property('handle');
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('locked');
            expect(res.body).to.have.property('expiry');
            done();
        })
    })

    it('query not exist mutex', (done) => {
        api.get("/" + uuid.v4()).expect(400).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            done();
        })
    })
});

describe('Update Mutex TTL', function () {
    it('update ttl', done => {
        api.patch('/testkey/' + handle).send({
            'ttl': 1000
        }).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('handle');
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('locked');
            expect(res.body).to.have.property('expiry');
            assert(res.body.expiry === expiry + 1000);
            done();
        })
    })

    it('update ttl no ttl body', done => {
        api.patch('/testkey/' + handle).expect(400).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            console.log(res.body)
            done();
        })
    })
})

describe('Delete Mutex', function () {
    it('delete mutex', done => {
        api.delete('/testkey/' + handle).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            done();
        })
    })

    it('delete not exist mutex', done => {
        api.delete('/testkey/' + handle).expect(400).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('message');
            assert(res.body.message === 'Invalid ID Supplied');
            done();
        })
    })
})