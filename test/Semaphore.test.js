const uuid = require('uuid')
const supertest = require('supertest')
const {
    expect,
    assert
} = require('chai')

const api = supertest('http://localhost:8080/v1/semaphore')

let handle;
let testkey = uuid.v4()

// before(function (done) {
//     require('../index.js')
//     done()
// });

describe('Create Semaphore', function () {
    it('create semaphore', done => {
        api.put(`/${testkey}`).send({
            'capacity': 2
        }).expect(200).end(((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('handle');
            handle = res.body.handle
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('count');
            expect(res.body).to.have.property('capacity');
            assert(res.body.capacity === 2);
            expect(res.body).to.have.property('expiry');
            done();
        }))
    })

    it('create semaphore again', done => {
        api.put(`/${testkey}`).send({
            'capacity': 5
        }).expect(409).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            done();
        })
    })
})

describe('Get Semaphore Status', function () {
    it('get semaphore status', done => {
        api.get(`/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('handle');
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('count');
            expect(res.body).to.have.property('capacity');
            expect(res.body).to.have.property('expiry');
            done();
        })
    })
})

describe('Acquires A Permit', function () {
    // before(function (done) {
    //     done()
    // });

    it('Acquires a permit from semaphore', done => {
        api.patch(`/acquires/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            expect(res.body).to.have.property('handle');
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('count');
            assert(res.body.count === 1);
            expect(res.body).to.have.property('capacity');
            expect(res.body).to.have.property('expiry');
        })

        api.patch(`/acquires/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            assert(res.body.count === 2);
            done()
        })
    })

    it('Acquires a permit exceed capacity', done => {
        api.patch(`/acquires/${testkey}/${handle}`).expect(400).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
        })

        api.get(`/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            assert(res.body.count === 2);
            done()
        })
    })
})


describe('Releases A Permit', function () {
    it('Releases a permit from semaphore', done => {
        api.patch(`/releases/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            assert(res.body.count === 1);
            done()
        })
    })

    it('Releases a permit from semaphore', done => {
        api.patch(`/releases/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }
            assert(res.body.count === 0);
            done()
        })
    })

    it('Releases a permit from semaphore', done => {
        api.patch(`/releases/${testkey}/${handle}`).expect(400)
        done()
    })
})

describe('Delete Semaphore', _ => {
    it('delete semaphore', done => {
        api.delete(`/${testkey}/${handle}`).expect(200).end((err, res) => {
            if (err) {
                done(err);
                return;
            }    
        })
        done()
    })

    it('delete not exist semaphore', done => {
        api.delete(`/${testkey}/${handle}`).expect(400)
        done()
    })
})